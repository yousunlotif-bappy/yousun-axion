def generate_optimization_plan(scan_result: dict, doctor_result: dict | None = None):
    """
    Generate an optimization plan based on project scan results.

    This function checks detected issues such as:
    - FP32 precision usage
    - High batch size
    - CUDA-specific dependency
    - LLM inference workload
    - Low readiness score

    Then it returns a structured optimization plan with:
    - Recommended steps
    - Priority level
    - Expected performance gain
    - Estimated readiness improvement
    """

    # Get detected issues from the scan result.
    # If no issue exists, use an empty list.
    issues = scan_result.get("issues_detected", [])

    # Get current readiness score.
    # If missing, use default score 50.
    readiness_score = scan_result.get("readiness_score", 50)

    # Get detected precision type, for example FP32 or Unknown.
    precision = scan_result.get("precision", "Unknown")

    # Get workload type, for example LLM Inference or AI Workload.
    workload_type = scan_result.get("workload_type", "AI Workload")

    # This list will store all optimization steps.
    plan = []

    # Estimated improvement values.
    # These are projected gains after applying recommended optimizations.
    estimated_gains = {
        "latency_reduction": 0,
        "memory_reduction": 0,
        "throughput_gain": 0,
        "readiness_gain": 0
    }

    # Convert all issue titles into one lowercase string.
    # This makes it easier to check whether issues contain keywords like "fp32", "cuda", or "batch".
    issue_titles = " ".join([issue.get("title", "").lower() for issue in issues])

    # ---------------------------------------------------------
    # 1. FP32 optimization
    # ---------------------------------------------------------
    # If FP32 precision is detected, recommend BF16.
    # BF16 usually reduces memory usage and improves inference speed on AMD GPUs.
    if precision == "FP32" or "fp32" in issue_titles:
        plan.append({
            "step": 1,
            "title": "Convert FP32 operations to BF16",
            "priority": "High",
            "impact": "High",
            "effort": "Low",
            "reason": "FP32 increases memory usage and can reduce inference performance on AMD GPUs.",
            "recommendation": "Use torch_dtype=torch.bfloat16 where supported.",
            "expected_gain": {
                "memory": "20–40% lower memory usage",
                "latency": "10–30% lower latency"
            }
        })

        # Add estimated gain values for this optimization.
        estimated_gains["memory_reduction"] += 25
        estimated_gains["latency_reduction"] += 18
        estimated_gains["readiness_gain"] += 18

    # ---------------------------------------------------------
    # 2. Batch size optimization
    # ---------------------------------------------------------
    # If batch size issue is detected or readiness score is low,
    # recommend tuning batch size to reduce HIP out-of-memory risk.
    if "batch" in issue_titles or readiness_score < 70:
        plan.append({
            "step": len(plan) + 1,
            "title": "Tune batch size for AMD GPU memory stability",
            "priority": "High",
            "impact": "High",
            "effort": "Low",
            "reason": "Large batch sizes may trigger HIP out-of-memory errors.",
            "recommendation": "Reduce batch size first, then benchmark gradually increasing values.",
            "expected_gain": {
                "memory": "15–35% lower peak memory",
                "stability": "Lower OOM risk"
            }
        })

        # Add estimated memory and readiness improvement.
        estimated_gains["memory_reduction"] += 18
        estimated_gains["readiness_gain"] += 12

    # ---------------------------------------------------------
    # 3. CUDA dependency optimization
    # ---------------------------------------------------------
    # If CUDA-specific issues are detected, recommend replacing them
    # with ROCm-compatible alternatives.
    if "cuda" in issue_titles:
        plan.append({
            "step": len(plan) + 1,
            "title": "Replace CUDA-specific dependencies with ROCm-compatible alternatives",
            "priority": "High",
            "impact": "High",
            "effort": "Medium",
            "reason": "CUDA-only packages reduce portability on AMD ROCm environments.",
            "recommendation": "Audit packages such as cupy, xformers, flash-attn, cublas, and NVIDIA-specific builds.",
            "expected_gain": {
                "compatibility": "Higher ROCm portability",
                "readiness": "Major readiness improvement"
            }
        })

        # CUDA removal mainly improves ROCm readiness.
        estimated_gains["readiness_gain"] += 20

    # ---------------------------------------------------------
    # 4. Inference mode optimization
    # ---------------------------------------------------------
    # If the workload is inference-based, recommend torch.inference_mode().
    # This disables gradient calculation and reduces memory/runtime overhead.
    if workload_type.lower().find("inference") >= 0:
        plan.append({
            "step": len(plan) + 1,
            "title": "Enable inference mode for model generation",
            "priority": "Medium",
            "impact": "Medium",
            "effort": "Low",
            "reason": "Inference mode disables gradient tracking and reduces overhead.",
            "recommendation": "Wrap generation with torch.inference_mode().",
            "expected_gain": {
                "latency": "5–15% faster inference",
                "memory": "Reduced runtime overhead"
            }
        })

        # Add estimated speed, throughput, and readiness improvement.
        estimated_gains["latency_reduction"] += 8
        estimated_gains["throughput_gain"] += 8
        estimated_gains["readiness_gain"] += 8

    # ---------------------------------------------------------
    # 5. Benchmark profile
    # ---------------------------------------------------------
    # Always recommend adding benchmark scripts.
    # This helps prove before/after improvement for hackathon or production use.
    plan.append({
        "step": len(plan) + 1,
        "title": "Add ROCm benchmark profile",
        "priority": "Medium",
        "impact": "Medium",
        "effort": "Medium",
        "reason": "Without benchmark scripts, performance improvements cannot be proven.",
        "recommendation": "Add latency, tokens/sec, throughput, and memory benchmark scripts.",
        "expected_gain": {
            "visibility": "Clear before/after performance proof",
            "submission_value": "Stronger hackathon evidence"
        }
    })

    # Benchmarking improves project quality and submission readiness.
    estimated_gains["readiness_gain"] += 10

    # ---------------------------------------------------------
    # 6. LLM attention optimization
    # ---------------------------------------------------------
    # If the workload is an LLM workload, recommend optimizing attention
    # and memory transfer paths.
    if workload_type.lower().find("llm") >= 0:
        plan.append({
            "step": len(plan) + 1,
            "title": "Optimize attention path and memory transfers",
            "priority": "Medium",
            "impact": "High",
            "effort": "Medium",
            "reason": "LLM inference is often bottlenecked by attention and memory movement.",
            "recommendation": "Use ROCm-compatible efficient attention paths where available.",
            "expected_gain": {
                "throughput": "10–40% higher throughput",
                "latency": "Lower token generation latency"
            }
        })

        # Attention optimization can improve throughput and latency.
        estimated_gains["throughput_gain"] += 28
        estimated_gains["latency_reduction"] += 12
        estimated_gains["readiness_gain"] += 8

    # ---------------------------------------------------------
    # 7. Limit maximum estimated gains
    # ---------------------------------------------------------
    # Prevent unrealistic gain values.
    # No projected gain should be more than 85%.
    for key in estimated_gains:
        estimated_gains[key] = min(estimated_gains[key], 85)

    # Calculate final optimized readiness score.
    # The maximum optimized score is capped at 96.
    optimized_score = min(96, readiness_score + estimated_gains["readiness_gain"])

    # Return final optimization report.
    # This response can be directly used by the frontend or API.
    return {
        "workload_type": workload_type,
        "current_readiness_score": readiness_score,
        "optimized_readiness_score": optimized_score,
        "optimization_confidence": 94,
        "implementation_effort": "Medium",
        "estimated_time": "2–4 hours",
        "plan": plan,
        "projected_gains": estimated_gains
    }





# This agent works like an AI GPU optimization planner.
# It receives scan results from the project analyzer.
# Then it checks what problems exist in the workload.
# Based on those problems, it creates a step-by-step optimization plan.
# The goal is to improve ROCm readiness, reduce memory usage,
# reduce latency, and increase throughput on AMD GPUs.

