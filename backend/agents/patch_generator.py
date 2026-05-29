

# Regular expression library.
# This helps us find flexible code patterns such as:
# batch_size = 8, batch_size=8, batch_size   =   8
import re

# unified_diff is used to create a Git-style difference between
# original code and optimized code.
from difflib import unified_diff


def generate_patch(original_code: str):
    """
    Generate an automatic optimization patch for Python AI workload code.

    This function takes original source code as text, checks for common
    GPU optimization problems, and returns:

    - optimized_code: improved version of the code
    - applied_changes: list of changes made
    - diff: Git-style patch showing before/after changes
    - summary: patch status and estimated impact

    Main optimizations:
    1. Convert FP32 to BF16
    2. Reduce high batch size
    3. Replace hardcoded CUDA device
    4. Add torch.inference_mode()
    5. Add model.eval()
    """

    # Start with the original code.
    # We will modify this copy step by step.
    optimized_code = original_code

    # This list stores all changes applied by the patch generator.
    applied_changes = []

    # ---------------------------------------------------------
    # 1. Convert FP32 precision to BF16
    # ---------------------------------------------------------
    # FP32 uses more GPU memory.
    # BF16 is usually better for inference on modern AMD GPUs.
    fp32_patterns = [
        ("torch.float32", "torch.bfloat16"),
        ("torch_dtype=torch.float32", "torch_dtype=torch.bfloat16"),
        ("torch_dtype = torch.float32", "torch_dtype = torch.bfloat16"),
    ]

    # Loop through every FP32 pattern.
    # If found, replace it with BF16.
    for old, new in fp32_patterns:
        if old in optimized_code:
            optimized_code = optimized_code.replace(old, new)

            # Save information about this applied optimization.
            applied_changes.append({
                "title": "Converted FP32 to BF16",
                "impact": "High",
                "reason": "BF16 reduces memory usage and improves AMD GPU inference efficiency."
            })

    # ---------------------------------------------------------
    # 2. Reduce high batch size
    # ---------------------------------------------------------
    # Large batch sizes can cause HIP out-of-memory errors.
    # This section reduces risky batch sizes to safer values.
    batch_patterns = [
        (r"batch_size\s*=\s*8", "batch_size = 4"),
        (r"batch_size\s*=\s*16", "batch_size = 4"),
        (r"batch_size\s*=\s*32", "batch_size = 8"),
    ]

    # Use regex because batch size can be written with different spacing.
    for pattern, replacement in batch_patterns:
        if re.search(pattern, optimized_code):
            optimized_code = re.sub(pattern, replacement, optimized_code)

            applied_changes.append({
                "title": "Tuned batch size",
                "impact": "High",
                "reason": "Reducing batch size lowers HIP out-of-memory risk."
            })

    # ---------------------------------------------------------
    # 3. Replace hardcoded CUDA device
    # ---------------------------------------------------------
    # Hardcoded .to("cuda") or .to('cuda') makes the code less portable.
    # Device abstraction allows the code to run on GPU if available,
    # otherwise it can fallback to CPU.
    if '.to("cuda")' in optimized_code or ".to('cuda')" in optimized_code:

        # If no device variable exists, add one at the top of the code.
        if "device = " not in optimized_code:
            optimized_code = "device = 'cuda' if torch.cuda.is_available() else 'cpu'\n" + optimized_code

        # Replace direct CUDA usage with device variable.
        optimized_code = optimized_code.replace('.to("cuda")', ".to(device)")
        optimized_code = optimized_code.replace(".to('cuda')", ".to(device)")

        applied_changes.append({
            "title": "Replaced hardcoded CUDA device",
            "impact": "High",
            "reason": "Device abstraction improves portability across ROCm-compatible PyTorch environments."
        })

    # ---------------------------------------------------------
    # 4. Add torch.inference_mode()
    # ---------------------------------------------------------
    # During inference, gradient calculation is not needed.
    # torch.inference_mode() disables gradient tracking,
    # reducing memory usage and runtime overhead.
    if "model.generate(" in optimized_code and "torch.inference_mode()" not in optimized_code:
        optimized_code = re.sub(
            r"outputs\s*=\s*model\.generate\(([\s\S]*?)\)\n",
            r"with torch.inference_mode():\n    outputs = model.generate(\1)\n",
            optimized_code,
            count=1
        )

        applied_changes.append({
            "title": "Enabled torch.inference_mode()",
            "impact": "Medium",
            "reason": "Inference mode disables gradient tracking and reduces runtime overhead."
        })

    # ---------------------------------------------------------
    # 5. Add model.eval()
    # ---------------------------------------------------------
    # model.eval() switches the model from training mode to inference mode.
    # This is important because layers like dropout behave differently
    # during training and inference.
    if "AutoModelForCausalLM.from_pretrained" in optimized_code and "model.eval()" not in optimized_code:
        optimized_code = optimized_code.replace(
            "tokenizer = AutoTokenizer.from_pretrained(model_name)",
            "model.eval()\n\ntokenizer = AutoTokenizer.from_pretrained(model_name)"
        )

        applied_changes.append({
            "title": "Added model.eval()",
            "impact": "Medium",
            "reason": "Evaluation mode improves inference stability and avoids training-time behavior."
        })

    # ---------------------------------------------------------
    # 6. Create unified diff
    # ---------------------------------------------------------
    # This creates a patch-style comparison between original.py and optimized.py.
    # It is useful for showing exactly what changed.
    diff_lines = list(
        unified_diff(
            original_code.splitlines(),
            optimized_code.splitlines(),
            fromfile="original.py",
            tofile="optimized.py",
            lineterm=""
        )
    )

    # ---------------------------------------------------------
    # 7. Handle case where no optimization was needed
    # ---------------------------------------------------------
    # If no known pattern was detected, return a safe message.
    if not applied_changes:
        applied_changes.append({
            "title": "No automatic patch required",
            "impact": "Low",
            "reason": "No known optimization patterns were detected in the provided code."
        })

    # ---------------------------------------------------------
    # 8. Return final patch report
    # ---------------------------------------------------------
    # This output can be directly used in the API/frontend.
    return {
        "applied_changes": applied_changes,
        "original_code": original_code,
        "optimized_code": optimized_code,
        "diff": "\n".join(diff_lines),
        "summary": {
            "changes_count": len(applied_changes),
            "patch_status": "Generated" if optimized_code != original_code else "No changes required",
            "estimated_impact": "High" if len(applied_changes) >= 3 else "Medium"
        }
    }





# This agent works like an automatic code patch generator.
# It receives raw Python code as text.
# Then it searches for common GPU optimization problems.
# If it finds risky patterns, it automatically rewrites the code.
# Finally, it returns the improved code, applied changes, and a diff view.


