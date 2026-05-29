from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.rocm_doctor_agent import diagnose_rocm_error
from agents.optimizer_agent import generate_optimization_plan
from agents.patch_generator import generate_patch
from agents.benchmark_agent import run_benchmark
from agents.report_agent import generate_readiness_report


PROJECT_META = {
    "name": "YOUSUN Axion",
    "tagline": "Autonomous GPU Intelligence for AI Workloads",
    "version": "1.0.0",
    "target_gpu": "AMD MI300X",
    "environment": "ROCm 6.1.2",
    "workflow": [
        "Project Scan",
        "ROCm Doctor",
        "Optimizer",
        "Patch Generator",
        "Benchmark",
        "Report"
    ]
}


app = FastAPI(
    title="YOUSUN Axion API",
    description="Autonomous GPU Intelligence for AI Workloads",
    version="1.0.0"
)

# CORS configuration for local development and Vercel deployment.
# Local frontend: http://localhost:3000
# Deployed frontend: any https://*.vercel.app domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ErrorLogRequest(BaseModel):
    error_log: str


class OptimizeRequest(BaseModel):
    scan_result: dict
    doctor_result: dict | None = None


class PatchRequest(BaseModel):
    code: str


class BenchmarkRequest(BaseModel):
    scan_result: dict | None = None
    optimization_result: dict | None = None


class ReportRequest(BaseModel):
    scan_result: dict | None = None
    doctor_result: dict | None = None
    optimization_result: dict | None = None
    patch_result: dict | None = None
    benchmark_result: dict | None = None


class PipelineRequest(BaseModel):
    code: str
    error_log: str | None = None


@app.get("/")
def home():
    return {
        "project": PROJECT_META["name"],
        "tagline": PROJECT_META["tagline"],
        "version": PROJECT_META["version"],
        "status": "running",
        "target_gpu": PROJECT_META["target_gpu"],
        "environment": PROJECT_META["environment"]
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "api": "running",
        "project": PROJECT_META["name"],
        "version": PROJECT_META["version"],
        "environment": PROJECT_META["environment"],
        "target_gpu": PROJECT_META["target_gpu"]
    }


@app.get("/api-info")
def api_info():
    return {
        "project": PROJECT_META,
        "available_endpoints": [
            "GET /",
            "GET /health",
            "GET /sample-demo",
            "GET /api-info",
            "POST /scan",
            "POST /doctor",
            "POST /optimize",
            "POST /generate-patch",
            "POST /benchmark",
            "POST /report",
            "POST /run-pipeline"
        ],
        "winning_message": "YOUSUN Axion turns slow or broken AI workloads into AMD-ready, optimized, benchmarked deployments."
    }


@app.get("/sample-demo")
def get_sample_demo():
    sample_code = """import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model_name = "meta-llama/Llama-2-7b-chat-hf"

batch_size = 8

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32
)

model = model.to("cuda")

tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "Explain AMD GPU optimization."

inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

outputs = model.generate(
    **inputs,
    max_new_tokens=128
)

print(tokenizer.decode(outputs[0]))
"""

    sample_error = "RuntimeError: HIP out of memory while running model.generate on cuda device."

    return {
        "project_name": "Retail-LLM-Inference",
        "description": "A sample slow/broken LLM inference workload for AMD GPU readiness testing.",
        "code": sample_code,
        "error_log": sample_error,
        "known_issues": [
            "FP32 precision detected",
            "High batch size detected",
            "CUDA-specific device usage",
            "HIP out-of-memory risk"
        ]
    }


@app.post("/scan")
async def scan_project(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")

    issues = []

    if "torch.cuda" in text or "cuda" in text.lower():
        issues.append({
            "title": "CUDA-specific usage detected",
            "severity": "High",
            "description": "Code contains CUDA-specific calls that may need ROCm compatibility review."
        })

    if "float32" in text or "torch.float32" in text:
        issues.append({
            "title": "FP32 precision detected",
            "severity": "Medium",
            "description": "FP32 may increase GPU memory usage. BF16 is recommended for AMD GPU optimization."
        })

    if "batch_size = 8" in text or "batch_size=8" in text:
        issues.append({
            "title": "High batch size detected",
            "severity": "High",
            "description": "Large batch size may cause HIP out-of-memory issues."
        })

    readiness_score = 92 if len(issues) == 0 else max(35, 96 - len(issues) * 18)

    return {
        "project_name": "Retail-LLM-Inference",
        "framework": "PyTorch" if "torch" in text else "Unknown",
        "workload_type": "LLM Inference" if "generate" in text or "AutoModel" in text else "AI Workload",
        "precision": "FP32" if "float32" in text or "torch.float32" in text else "Unknown",
        "target_gpu": PROJECT_META["target_gpu"],
        "environment": PROJECT_META["environment"],
        "readiness_score": readiness_score,
        "issues_detected": issues
    }


@app.post("/doctor")
def rocm_doctor(request: ErrorLogRequest):
    return diagnose_rocm_error(request.error_log)


@app.post("/optimize")
def optimize_project(request: OptimizeRequest):
    return generate_optimization_plan(
        scan_result=request.scan_result,
        doctor_result=request.doctor_result
    )


@app.post("/generate-patch")
def generate_code_patch(request: PatchRequest):
    return generate_patch(request.code)


@app.post("/benchmark")
def benchmark_project(request: BenchmarkRequest):
    return run_benchmark(
        scan_result=request.scan_result,
        optimization_result=request.optimization_result
    )


@app.post("/report")
def generate_report(request: ReportRequest):
    return generate_readiness_report(
        scan_result=request.scan_result,
        doctor_result=request.doctor_result,
        optimization_result=request.optimization_result,
        patch_result=request.patch_result,
        benchmark_result=request.benchmark_result
    )


@app.post("/run-pipeline")
def run_full_pipeline(request: PipelineRequest):
    code = request.code
    error_log = request.error_log or ""

    issues = []

    if "torch.cuda" in code or "cuda" in code.lower():
        issues.append({
            "title": "CUDA-specific usage detected",
            "severity": "High",
            "description": "Code contains CUDA-specific calls."
        })

    if "float32" in code or "torch.float32" in code:
        issues.append({
            "title": "FP32 precision detected",
            "severity": "Medium",
            "description": "FP32 may increase GPU memory usage."
        })

    if "batch_size = 8" in code or "batch_size=8" in code:
        issues.append({
            "title": "High batch size detected",
            "severity": "High",
            "description": "Large batch size may cause HIP out-of-memory."
        })

    scan_result = {
        "project_name": "Retail-LLM-Inference",
        "framework": "PyTorch" if "torch" in code else "Unknown",
        "workload_type": "LLM Inference" if "generate" in code or "AutoModel" in code else "AI Workload",
        "precision": "FP32" if "float32" in code or "torch.float32" in code else "Unknown",
        "target_gpu": PROJECT_META["target_gpu"],
        "environment": PROJECT_META["environment"],
        "readiness_score": max(35, 96 - len(issues) * 18),
        "issues_detected": issues
    }

    doctor_input = error_log if error_log else code
    doctor_result = diagnose_rocm_error(doctor_input)

    optimization_result = generate_optimization_plan(
        scan_result=scan_result,
        doctor_result=doctor_result
    )

    patch_result = generate_patch(code)

    benchmark_result = run_benchmark(
        scan_result=scan_result,
        optimization_result=optimization_result
    )

    report_result = generate_readiness_report(
        scan_result=scan_result,
        doctor_result=doctor_result,
        optimization_result=optimization_result,
        patch_result=patch_result,
        benchmark_result=benchmark_result
    )

    return {
        "pipeline_status": "Completed",
        "project": PROJECT_META["name"],
        "tagline": PROJECT_META["tagline"],
        "version": PROJECT_META["version"],
        "workflow": PROJECT_META["workflow"],
        "pipeline_summary": {
            "initial_readiness_score": scan_result.get("readiness_score"),
            "final_readiness_score": benchmark_result.get("after", {}).get("readiness_score"),
            "status": report_result.get("final_verdict", {}).get("status"),
            "latency_before": benchmark_result.get("before", {}).get("latency_seconds"),
            "latency_after": benchmark_result.get("after", {}).get("latency_seconds"),
            "tokens_per_second_before": benchmark_result.get("before", {}).get("tokens_per_second"),
            "tokens_per_second_after": benchmark_result.get("after", {}).get("tokens_per_second"),
            "memory_before": benchmark_result.get("before", {}).get("gpu_memory_gb"),
            "memory_after": benchmark_result.get("after", {}).get("gpu_memory_gb")
        },
        "scan_result": scan_result,
        "doctor_result": doctor_result,
        "optimization_result": optimization_result,
        "patch_result": patch_result,
        "benchmark_result": benchmark_result,
        "report_result": report_result
    }



    