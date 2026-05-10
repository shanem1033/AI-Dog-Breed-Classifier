// Global variables
const HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
const HUGGING_FACE_API_KEY = ''; // Hugging face API key
const RESNET_API_URL = 'https://api-inference.huggingface.co/models/microsoft/resnet-50';

let OPENAI_API_KEY = ''; // OpenAI API key will be inputted by the user


// Shane
// HTML 
document.body.innerHTML = `
  <style>
    body {
      font-family: 'Comic Sans MS', sans-serif;
      background: linear-gradient(120deg, #f6d365, #fda085);
      color: #333;
      margin: 0;
      padding: 0;
      text-align: center;
    }
    h1 {
      color: #fff;
      margin: 20px 0;
    }
    input, button {
      font-size: 16px;
      padding: 10px;
      margin: 10px 0;
      border: 2px solid #ff7eb3;
      border-radius: 5px;
    }
    input {
      width: 300px;
    }
    button {
      background-color: #ff7eb3;
      color: #fff;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    button:hover {
      background-color: #ff3b6f;
    }
    #result, #facts {
      margin: 20px auto;
      max-width: 600px;
      padding: 20px;
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      text-align: left;
    }
    #result img {
      display: block;
      margin: 20px auto;
      border-radius: 10px;
    }
    #apiKeyStatus {
      margin: 10px 0;
      font-weight: bold;
    }
    footer {
      margin-top: 20px;
      color: #fff;
      font-size: 14px;
    }
  </style>
  <h1>🐶 Dog Classifier 🐶</h1>
  <label for="openAiApiKey">🔑 Enter OpenAI API Key:</label>
  <br>
  <input type="text" id="openAiApiKey" placeholder="Enter OpenAI API Key">
  <br>
  <button id="setApiKeyButton">Set API Key</button>
  <p id="apiKeyStatus"></p>
  <hr style="border: none; height: 1px; background-color: #fff; width: 80%; margin: 20px auto;">
  <label for="imageUrl">📷 Enter Image URL: (Data URIs are not supported. Use a HTTP or HTTPS URL)</label>
  <br>
  <input type="text" id="imageUrl" placeholder="Paste the image URL here" disabled>
  <br>
  <button id="classifyButton" disabled>Classify Image</button>
  <div id="result"></div>
  <div id="facts"></div>
`;

// Sean
// Set API Key
$("#setApiKeyButton").click(function () {
  const apiKey = $("#openAiApiKey").val().trim();
  if (!apiKey) {
    $("#apiKeyStatus").text("Please enter a valid OpenAI API Key.").css("color", "red");
    return;
  }

  testOpenAiApiKey(apiKey).then((isValid) => {
    if (isValid) {
      OPENAI_API_KEY = apiKey;
      $("#apiKeyStatus").text("API Key validated successfully!").css("color", "green");
      $("#imageUrl").prop("disabled", false);
      $("#classifyButton").prop("disabled", false);
    } else {
      $("#apiKeyStatus").text("Invalid OpenAI API Key. Please try again.").css("color", "red");
    }
  });
});

// Sean
// Classify Image using Hugging Face and ResNet-50
$("#classifyButton").click(function () {
  const imageUrl = $("#imageUrl").val().trim();
  if (!imageUrl) {
    $("#result").html(`<p style="color: red;">Please enter a valid image URL.</p>`);
    return;
  }

  classifyImageWithHuggingFace(imageUrl);
});


// Shane
// Function to classify the image using Hugging Face and ResNet-50
function classifyImageWithHuggingFace(imageUrl) {
  const requestData = JSON.stringify({ inputs: imageUrl });

  $.ajaxSetup({
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`
    }
  });

  $.ajax({
    type: "POST",
    url: HUGGING_FACE_API_URL,
    data: requestData,
    dataType: "json",
    success: function (data) {
      const huggingFaceLabel = data[0]?.label || "Unknown";

    
      // Display the image and the Hugging Face result
      $("#result").html(`
        <h2>🎉 Classification Result</h2>
        <img src="${imageUrl}" alt="Classified Image" style="max-width: 300px;" />
        <p><strong>Hugging Face Result:</strong> ${huggingFaceLabel}</p>
      `);
      
      // Fetch facts about the breed using OpenAI API
      fetchDogFacts(huggingFaceLabel);

      // Fetch ResNet-50's interpretation of the image
      classifyImageWithResNet(imageUrl, huggingFaceLabel);
    },
    error: function () {
      $("#result").html(`<p style="color: red;">Error: Unable to classify the image using Hugging Face.</p>`);
      
        // MH edit - try ResNet anyway
        // classifyImageWithResNet(imageUrl, "");
  
    }
  });
}

// Sean
// Function to classify the image using ResNet-50
function classifyImageWithResNet(imageUrl, huggingFaceLabel) {
  const requestData = JSON.stringify({ inputs: imageUrl });

  $.ajaxSetup({
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`
    }
  });

  $.ajax({
    type: "POST",
    url: RESNET_API_URL,
    data: requestData,
    dataType: "json",
    success: function (data) {
      const resNetLabel = data[0]?.label || "Unknown";

      // Append the ResNet-50 result below the Hugging Face result
      $("#result").append(`
        <p><strong>ResNet-50 Result:</strong> ${resNetLabel}</p>
      `);
    },
    error: function () {
      $("#result").append(`<p style="color: red;">Error: Unable to classify the image using ResNet-50.</p>`);
    }
  });
}


// Sean
// Function to fetch dog facts using OpenAI
function fetchDogFacts(dogBreed) {
  const prompt = `Provide 10 interesting facts about the dog breed: ${dogBreed}.`;
  const requestData = JSON.stringify({
    model: "gpt-3.5-turbo",
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }]
  });

  $.ajaxSetup({
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    }
  });

  $.ajax({
    type: "POST",
    url: "https://api.openai.com/v1/chat/completions",
    data: requestData,
    dataType: "json",
    success: function (data) {
      const facts = data.choices[0]?.message?.content.trim() || "No facts found.";
      $("#facts").html(`
        <h2>🐾 Fun Facts about the Dog Breed</h2>
        <p>${facts}</p>
      `);
    },
    error: function () {
      $("#facts").html(`<p style="color: red;">Error: Unable to fetch facts about the dog breed.</p>`);
    }
  });
}


// Shane
// Test OpenAI API Key
async function testOpenAiApiKey(apiKey) {
  const prompt = `This is a test to validate the API key. Respond with "Key is valid." if the key works.`;

  const requestData = JSON.stringify({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [{ role: "user", content: prompt }]
  });

  try {
    const response = await $.ajax({
      type: "POST",
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      data: requestData,
      dataType: "json"
    });

    const message = response.choices[0]?.message?.content.trim();
    return message === "Key is valid.";
  } catch (error) {
    console.error("API Key Validation Error:", error);
    return false;
  }
}