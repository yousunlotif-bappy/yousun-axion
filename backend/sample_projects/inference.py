import torch
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

