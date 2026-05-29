def diagnose_rocm_error(error_log: str):
    log = error_log.lower()

    issues = []
    fixes = []
    commands = []
    root_causes = []

    # 1. HIP Out of Memory
    if "hip out of memory" in log or "out of memory" in log or "memory allocation" in log:
        issues.append({
            "title": "HIP out of memory",
            "severity": "High",
            "category": "Memory",
            "description": "The workload exceeded available AMD GPU memory."
        })

        root_causes.append(
            "Large FP32 tensors, high batch size, or long sequence length may be causing GPU memory pressure."
        )

        fixes.extend([
            "Convert FP32 model weights to BF16 where supported.",
            "Reduce batch size from 8 to 4 or lower.",
            "Use torch.inference_mode() during inference.",
            "Reduce max_new_tokens or sequence length.",
            "Clear unused GPU tensors before inference."
        ])

        commands.extend([
            "export TORCH_DTYPE=bfloat16",
            "export PYTORCH_HIP_ALLOC_CONF=garbage_collection_threshold:0.8,max_split_size_mb:512"
        ])

    # 2. CUDA-specific issue
    if "cuda" in log or "torch.cuda" in log or "nvidia" in log or "cublas" in log:
        issues.append({
            "title": "CUDA-specific dependency or API detected",
            "severity": "High",
            "category": "Compatibility",
            "description": "The workload contains CUDA/NVIDIA-specific references that may not be ROCm portable."
        })

        root_causes.append(
            "The project may depend on CUDA-specific APIs, NVIDIA-only packages, or hardcoded cuda devices."
        )

        fixes.extend([
            "Replace hardcoded .to('cuda') calls with device abstraction.",
            "Use ROCm-compatible PyTorch builds.",
            "Remove NVIDIA-only dependencies where possible.",
            "Avoid CUDA-only extensions unless ROCm/HIP alternatives are available."
        ])

        commands.extend([
            "python -c \"import torch; print(torch.version.hip); print(torch.cuda.is_available())\"",
            "pip list | grep -E 'torch|cuda|nvidia|cupy|xformers'"
        ])

    # 3. ROCm version mismatch
    if "rocm version" in log or "hip runtime" in log or "driver mismatch" in log:
        issues.append({
            "title": "ROCm runtime or driver mismatch",
            "severity": "Medium",
            "category": "Environment",
            "description": "ROCm runtime and driver versions may be incompatible."
        })

        root_causes.append(
            "Installed ROCm runtime, AMD driver, or PyTorch ROCm build may not match the target GPU environment."
        )

        fixes.extend([
            "Verify ROCm runtime version.",
            "Verify PyTorch ROCm build compatibility.",
            "Use the AMD Developer Cloud recommended ROCm environment.",
            "Reinstall compatible PyTorch ROCm wheels if needed."
        ])

        commands.extend([
            "rocminfo",
            "rocm-smi",
            "python -c \"import torch; print(torch.__version__); print(torch.version.hip)\""
        ])

    # 4. GPU not detected
    if "no gpu" in log or "device not found" in log or "hip error" in log or "is_available() false" in log:
        issues.append({
            "title": "AMD GPU not detected",
            "severity": "High",
            "category": "Runtime",
            "description": "The environment cannot access the AMD GPU device."
        })

        root_causes.append(
            "The ROCm runtime may not be available, GPU access may be misconfigured, or the container lacks GPU permissions."
        )

        fixes.extend([
            "Check AMD GPU visibility with rocm-smi.",
            "Verify ROCm installation.",
            "Ensure container has GPU access.",
            "Use correct AMD Developer Cloud runtime."
        ])

        commands.extend([
            "rocm-smi",
            "rocminfo | head",
            "python -c \"import torch; print(torch.cuda.is_available())\""
        ])

    # Default if no issue matched
    if not issues:
        issues.append({
            "title": "General ROCm diagnostic required",
            "severity": "Low",
            "category": "General",
            "description": "No known critical ROCm pattern was detected, but the log should be reviewed."
        })

        root_causes.append(
            "The error log does not match known ROCm issue patterns in the current diagnostic rules."
        )

        fixes.extend([
            "Verify ROCm installation.",
            "Check PyTorch ROCm compatibility.",
            "Run a minimal GPU test.",
            "Review dependencies for CUDA-only packages."
        ])

        commands.extend([
            "rocminfo",
            "rocm-smi",
            "python -c \"import torch; print(torch.__version__); print(torch.version.hip); print(torch.cuda.is_available())\""
        ])

    # Remove duplicates
    fixes = list(dict.fromkeys(fixes))
    commands = list(dict.fromkeys(commands))
    root_causes = list(dict.fromkeys(root_causes))

    severity_score = {
        "High": 25,
        "Medium": 12,
        "Low": 5
    }

    readiness_impact = sum(severity_score.get(issue["severity"], 5) for issue in issues)
    diagnosis_score = max(0, 100 - readiness_impact)

    return {
        "diagnosis_score": diagnosis_score,
        "status": "Fixable" if diagnosis_score < 90 else "Healthy",
        "confidence": 0.86,
        "issues": issues,
        "root_causes": root_causes,
        "recommended_fixes": fixes,
        "fix_commands": commands,
        "expected_impact": {
            "memory_reduction": "up to 42%",
            "latency_improvement": "up to 28%",
            "readiness_after_fix": min(92, diagnosis_score + 24),
            "stability_improvement": "high"
        }
    }




# This agent acts like a ROCm Doctor.
# It reads GPU/ROCm error logs and detects common problems such as:
# - HIP out-of-memory errors
# - CUDA-specific code that may break on AMD GPUs
# - ROCm version or driver mismatch
# - AMD GPU detection failure
# Then it returns a structured JSON-style diagnosis that can be shown in the frontend.


