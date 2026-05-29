def run_benchmark(scan_result: dict | None = None, optimization_result: dict | None = None):
    """
    Run a simulated benchmark for the AI workload.

    This is an MVP benchmark simulator.
    It does not run a real GPU benchmark yet.

    Later, this function can be connected with:
    - AMD Developer Cloud
    - ROCm benchmark logs
    - real latency results
    - real GPU memory usage
    - real throughput metrics

    For now, it creates before/after performance results
    based on scan and optimization data.
    """

    # If scan_result is None, use an empty dictionary.
    # This prevents errors when no scan result is provided.
    scan_result = scan_result or {}

    # If optimization_result is None, use an empty dictionary.
    # This prevents errors when no optimization result is provided.
    optimization_result = optimization_result or {}

    # Get the current readiness score from scan result.
    # If missing, default value is 42.
    current_score = scan_result.get("readiness_score", 42)

    # Get the optimized readiness score from optimization result.
    # If missing, default value is 92.
    optimized_score = optimization_result.get("optimized_readiness_score", 92)

    # Get workload type, for example: LLM Inference.
    workload_type = scan_result.get("workload_type", "LLM Inference")

    # Get target GPU name.
    target_gpu = scan_result.get("target_gpu", "AMD MI300X")

    # Get environment name.
    environment = scan_result.get("environment", "ROCm")

    # ---------------------------------------------------------
    # 1. Before optimization benchmark result
    # ---------------------------------------------------------
    # This represents the workload performance before applying optimization.
    # Values are simulated for MVP/demo purpose.
    before = {
        "status": "Failed / Slow" if current_score < 60 else "Running",
        "latency_seconds": 5.42,
        "tokens_per_second": 28.4,
        "gpu_memory_gb": 42.3,
        "throughput_requests_per_second": 1.8,
        "gpu_utilization_percent": 71,
        "readiness_score": current_score,
        "precision": "FP32",
        "batch_size": 8
    }

    # ---------------------------------------------------------
    # 2. After optimization benchmark result
    # ---------------------------------------------------------
    # This represents the workload performance after optimization.
    # It assumes BF16, smaller batch size, and inference optimization.
    after = {
        "status": "Passed / Fast",
        "latency_seconds": 2.31,
        "tokens_per_second": 71.6,
        "gpu_memory_gb": 24.7,
        "throughput_requests_per_second": 4.6,
        "gpu_utilization_percent": 92,
        "readiness_score": optimized_score,
        "precision": "BF16",
        "batch_size": 4
    }

    # ---------------------------------------------------------
    # 3. Calculate performance improvements
    # ---------------------------------------------------------
    # This section compares before and after values.
    improvements = {
        # Lower latency is better, so we calculate reduction percentage.
        "latency_reduction_percent": calculate_reduction(
            before["latency_seconds"],
            after["latency_seconds"]
        ),

        # Higher tokens per second is better, so we calculate gain percentage.
        "tokens_per_second_gain_percent": calculate_gain(
            before["tokens_per_second"],
            after["tokens_per_second"]
        ),

        # Lower GPU memory usage is better, so we calculate reduction percentage.
        "memory_reduction_percent": calculate_reduction(
            before["gpu_memory_gb"],
            after["gpu_memory_gb"]
        ),

        # Higher throughput is better, so we calculate gain percentage.
        "throughput_gain_percent": calculate_gain(
            before["throughput_requests_per_second"],
            after["throughput_requests_per_second"]
        ),

        # Higher GPU utilization means the GPU is being used more effectively.
        "gpu_utilization_gain_percent": calculate_gain(
            before["gpu_utilization_percent"],
            after["gpu_utilization_percent"]
        ),

        # Readiness gain is calculated as simple score difference.
        "readiness_gain_points": after["readiness_score"] - before["readiness_score"]
    }

    # Final benchmark score.
    # It adds a small bonus to optimized readiness score.
    # Maximum score is capped at 100.
    benchmark_score = min(100, after["readiness_score"] + 4)

    # Human-readable insights for frontend/demo.
    key_insights = [
        "BF16 precision reduced memory pressure and improved inference efficiency.",
        "Batch size tuning lowered HIP out-of-memory risk.",
        "Inference mode reduced runtime overhead.",
        "Optimized configuration improved latency and throughput.",
        "The workload is now closer to AMD-ready deployment."
    ]

    # ---------------------------------------------------------
    # 4. Return final benchmark report
    # ---------------------------------------------------------
    # This output can be directly shown in frontend dashboard.
    return {
        "benchmark_status": "Completed",
        "benchmark_score": benchmark_score,
        "workload_type": workload_type,
        "target_gpu": target_gpu,
        "environment": environment,
        "before": before,
        "after": after,
        "improvements": improvements,
        "best_profile": "BF16 + batch size 4 + inference mode",
        "production_recommendation": "Ready for AMD GPU validation and deployment",
        "key_insights": key_insights
    }


def calculate_reduction(before: float, after: float):
    """
    Calculate percentage reduction.

    Used when lower value is better.

    Example:
    - latency before = 5.42
    - latency after = 2.31
    - reduction = how much latency decreased in percentage
    """

    # Avoid division by zero error.
    if before == 0:
        return 0

    # Formula:
    # ((before - after) / before) * 100
    return round(((before - after) / before) * 100, 1)


def calculate_gain(before: float, after: float):
    """
    Calculate percentage gain.

    Used when higher value is better.

    Example:
    - tokens/sec before = 28.4
    - tokens/sec after = 71.6
    - gain = how much performance increased in percentage
    """

    # Avoid division by zero error.
    if before == 0:
        return 0

    # Formula:
    # ((after - before) / before) * 100
    return round(((after - before) / before) * 100, 1)





# This agent works like a benchmark simulator.
# It compares workload performance before and after optimization.
# It calculates latency reduction, memory reduction, throughput gain,
# GPU utilization gain, and readiness score improvement.
# For now it uses simulated values for MVP/demo.
# Later it can be connected to real ROCm or AMD Developer Cloud benchmark results.

