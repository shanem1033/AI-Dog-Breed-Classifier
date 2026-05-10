# AI Dog-Breed Classifier
---

A web-based dog breed classifier built for an AI and Advanced Algorithms assignment. The app combines two computer vision models from Hugging Face with OpenAI's GPT API to identify dog breeds from image URLs and return interesting facts about the detected breed.

---

## Features

- **Dual image classification** — runs the uploaded image through both Google's ViT (Vision Transformer) and Microsoft's ResNet-50 models in parallel, displaying both results
- **Breed fact generation** — uses OpenAI's GPT-3.5 Turbo to generate 10 fun facts about the identified breed
- **API key validation** — validates the user's OpenAI key with a test call before enabling the classifier
- **Simple browser-based UI** — no build step or server required; runs entirely in the browser using jQuery and AJAX

---

## Models Used

| Model | Provider | Purpose |
|---|---|---|
| `google/vit-base-patch16-224` | Hugging Face | Primary image classification (Vision Transformer) |
| `microsoft/resnet-50` | Hugging Face | Secondary image classification (ResNet-50) |
| `gpt-3.5-turbo` | OpenAI | Breed fact generation |

---

## Prerequisites

- A valid **OpenAI API key** (entered at runtime in the UI)
- A **Hugging Face API key** (set in the source code as `HUGGING_FACE_API_KEY`)
- A modern web browser

> **Note:** The app accepts HTTP/HTTPS image URLs only. Data URIs are not supported by the Hugging Face Inference API.

---

## Setup

1. Clone or download this repository.
2. Open the source file and add your Hugging Face API key:
   ```js
   const HUGGING_FACE_API_KEY = 'your_huggingface_key_here';
   ```
3. Open the HTML file in a browser (no server needed).
4. Enter your **OpenAI API key** in the UI and click **Set API Key**.
5. Once validated, paste an image URL and click **Classify Image**.

---

## How It Works

1. The user submits an OpenAI API key, which is validated via a test prompt before the classifier is unlocked.
2. On classification, the image URL is sent to the **ViT model** on Hugging Face's Inference API.
3. Simultaneously, the same URL is sent to **ResNet-50** for a secondary classification.
4. The top predicted label from ViT is passed to **GPT-3.5 Turbo**, which returns 10 facts about that breed.
5. All three results are rendered in the UI below the image.

---

## Contributors

| Name | Contributions |
|---|---|
| Shane | UI/HTML layout, `classifyImageWithHuggingFace()`, `testOpenAiApiKey()` |
| Sean | API key flow, `classifyImageWithResNet()`, `fetchDogFacts()` |

---

## Limitations

- Classification is limited to dog breeds included in ImageNet (the training dataset for both ViT and ResNet-50).
- Non-dog images will still return a classification result — the models do not reject out-of-scope inputs.
- The Hugging Face free tier may rate-limit or cold-start models, causing occasional delays or errors.
