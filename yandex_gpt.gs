/**  
 * Получает IAM-токен для Yandex Cloud  
 * @param {string} oauthToken OAuth-токен Яндекс  
 * @return {string} IAM-токен  
 */  
function getYandexIAMToken(oauthToken) {  
  const url = 'https://iam.api.cloud.yandex.net/iam/v1/tokens';  
  
  const payload = {  
    "yandexPassportOauthToken": oauthToken  
  };  
  
  const options = {  
    method: 'post',  
    contentType: 'application/json',  
    payload: JSON.stringify(payload)  
  };  
  
  try {  
    const response = UrlFetchApp.fetch(url, options);  
    const jsonResponse = JSON.parse(response.getContentText());  
    
    // Проверяем наличие IAM-токена  
    if (jsonResponse.iamToken) {  
      // Сохраняем IAM-токен в свойствах скрипта с меткой времени  
      PropertiesService.getScriptProperties().setProperty('YANDEX_IAM_TOKEN', jsonResponse.iamToken);  
      PropertiesService.getScriptProperties().setProperty('YANDEX_IAM_TOKEN_EXPIRES', jsonResponse.expiresAt);  
      
      return jsonResponse.iamToken;  
    } else {  
      throw new Error('Не удалось получить IAM-токен');  
    }  
  } catch (error) {  
    throw new Error('Ошибка при получении IAM-токена: ' + error.message);  
  }  
}  

/**  
 * Проверяет валидность IAM-токена  
 * @return {boolean} Признак валидности токена  
 */  
function isIAMTokenValid() {  
  const scriptProperties = PropertiesService.getScriptProperties();  
  const iamToken = scriptProperties.getProperty('YANDEX_IAM_TOKEN');  
  const expiresAt = scriptProperties.getProperty('YANDEX_IAM_TOKEN_EXPIRES');  
  
  // Если токена нет или он просрочен  
  if (!iamToken || !expiresAt) {  
    return false;  
  }  
  
  // Проверяем, не истек ли токен  
  // const expirationDate = new Date(expiresAt);
  // return expirationDate > new Date();

 const expirationDate = new Date(expiresAt);  
 const currentDate = new Date();  
  
  // Если срок действия токена меньше 12 часов  
 return expirationDate > currentDate && (expirationDate.getTime() - currentDate.getTime()) <= 12 * 60 * 60 * 1000;  

}  

/**  
 * Получает актуальный IAM-токен  
 * @param {string} oauthToken OAuth-токен Яндекс  
 * @return {string} Актуальный IAM-токен  
 */  
function getActualIAMToken(oauthToken) {  
  // Проверяем существующий токен  
  if (isIAMTokenValid()) {  
    return PropertiesService.getScriptProperties().getProperty('YANDEX_IAM_TOKEN');  
  }  
  
  // Получаем новый токен  
  return getYandexIAMToken(oauthToken);  
}  

/**
 * О моделях yandex GPT https://yandex.cloud/ru/docs/foundation-models/concepts/yandexgpt/models  
 * Функция для использования YandexGPT в Google Sheets  
 *   
 * @param {string} prompt Основной промпт для GPT  
 * @param {string} systemPrompt Системный промпт (контекст)  
 * @param {string} oauthToken OAuth-токен Яндекс  
 * @param {number} temperature Температура генерации (по умолчанию 0.3)  
 * @param {string} model Модель YandexGPT (по умолчанию "YandexGPT Lite")  
 * @return {string} Ответ от YandexGPT  
 */  

function YANDEX_GPT(prompt, systemPrompt = '', temperature = 0.3, model = 'yandexgpt-lite') {  
  // Замените на ваш реальный идентификатор каталога   
  const oauthToken =  "your_oauthToken";
  const FOLDER_ID = "your_FOLDER_ID";


  // Проверка обязательных параметров  
  if (!prompt) {  
    return 'Ошибка: Промпт не может быть пустым';  
  }  
  
  if (!oauthToken) {  
    return 'Ошибка: Необходим OAuth-токен';  
  }  
  
  // Получаем актуальный IAM-токен  
  let iamToken;  
  try {  
    iamToken = getActualIAMToken(oauthToken);  
  } catch (error) {  
    return 'Ошибка получения IAM-токена: ' + error.message;  
  }  
  
  // Базовый URL API Yandex GPT  
  const API_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';  
  
  // Подготовка тела запроса  
  const payload = {  
    "modelUri": `gpt://${FOLDER_ID}/${model}`,  
    "completionOptions": {  
      "stream": false,  
      "temperature": temperature,  
      "maxTokens": "2000"  
    },  
    "messages": []  
  };  
  
  // Добавление системного промпта, если он есть  
  if (systemPrompt) {  
    payload.messages.push({  
      "role": "system",  
      "text": systemPrompt  
    });  
  }  
  
  // Добавление основного промпта  
  payload.messages.push({  
    "role": "user",  
    "text": prompt  
  });  
  
  // Настройка параметров запроса  
  const options = {  
    method: 'post',  
    contentType: 'application/json',  
    headers: {  
      'Authorization': `Bearer ${iamToken}`  
    },  
    payload: JSON.stringify(payload)  
  };  
  
  try {  
    // Выполнение запроса  
    const response = UrlFetchApp.fetch(API_URL, options);  
    const jsonResponse = JSON.parse(response.getContentText());  
    
    // Проверка и извлечение результата  
    if (jsonResponse.result && jsonResponse.result.alternatives && jsonResponse.result.alternatives.length > 0) {  
      return jsonResponse.result.alternatives[0].message.text;  
    } else {  
      return 'Не удалось получить ответ от YandexGPT';  
    }  
  } catch (error) {  
    return 'Ошибка при выполнении запроса: ' + error.message;  
  }  
}
