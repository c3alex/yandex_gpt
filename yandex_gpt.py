from yandex_cloud_ml_sdk import YCloudML
import json

# блок кода YaGPT
folder_id = "your_folder_id"
api_key = "your_api_key"

# Логинрование
log = []

def ya_gpt(prompt, text, temperature=0, gpt_model='yandexgpt', json_response=False):
    messages = [
    {
        "role": "system",
        "text": prompt,
    },
    {
        "role": "user",
        "text": text,
    },
    ]
    
    sdk = YCloudML(
        folder_id=folder_id,
        auth=api_key,
    )

    result = (
        sdk.models.completions(gpt_model).configure(temperature=temperature).run(messages)
    )

    # логирование обращений
    log.append({
                'request': text,
                'prompt': prompt,
                'response': result.alternatives[0].text.strip("`"),
                'gpt_model': gpt_model,        
                'cost': result.usage.total_tokens,
                'temperature': temperature
               })
    
    if json_response:
        return (json.loads(result.alternatives[0].text.strip("`")), # результат JSON
                result.usage.total_tokens # стоимость запроса в токинах
               )
    
    return (result.alternatives[0].text, # результат
            result.usage.total_tokens # стоимость запроса в токинах
           )