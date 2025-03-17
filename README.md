# Функции для подключения Yandex GPT через Python и Google script (Apps Script)

Функция для Google таблиц: `YANDEX_GPT(prompt, systemPrompt = '', temperature = 0.3, model = 'yandexgpt-lite')`, где
* prompt - запрос пользователя;
* systemPrompt - роль нейросети или инструкция ответа;
* temperature - креативность ответа;
* model - модель нейросети.

Примечание: необходимо указать собственный `oauthToken` и `FOLDER_ID`.

Функция на Python: `ya_gpt(prompt, text, temperature=0, gpt_model='yandexgpt', json_response=False)`, где
* prompt - роль нейросети или инструкция ответа;
* text - запрос;
* temperature - креативность ответа;
* gpt_model - модель нейросети; 
* json_response - обработка ответа в виде JSON.

Функция возвращает результат нейросети и стоимость запроса в токинах. Также производится логинрование ответов в список log.

Примечание: необходимо указать собственный `api_key` и `folder_id`.
