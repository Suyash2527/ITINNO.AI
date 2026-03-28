import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";
import { Itinerary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateItinerary(
  startingLocation: string,
  destination: string,
  budgetRs: number,
  days: number,
  travelers: number,
  travelType: string,
  language: string,
  travelScope: string
): Promise<Itinerary> {
  const prompt = `Generate a highly detailed and comprehensive travel itinerary from ${startingLocation} to ${destination} for ${days} days.
Budget: ₹${budgetRs} (Indian Rupees)
Travelers: ${travelers}
Travel Type: ${travelType}
Language: ${language}
Travel Scope: ${travelScope} (Local/Domestic vs International)

Rules:
- Optimize travel routes and avoid distant jumps.
- Respect daily time limits but maximize the experience.
- Provide a rich, detailed schedule for each day. Include at least 4-5 places/activities per day (morning, afternoon, evening).
- Suggest hidden gems and popular nearby attractions.
- Include specific, highly-rated food and restaurant suggestions for each day.
- Include specific hotel/accommodation suggestions that fit the budget.
- Respect user budget and travel type.
- Provide the best travel options from the boarding location (${startingLocation}) to the destination (${destination}) including mode, duration, cost, and a rich description. Provide booking links or provider names if possible. If it's an international trip, prioritize flights.
- For places, include the type (attraction, restaurant, hotel, activity), estimated price, and address if possible. Provide a rich, engaging description for each place.
- Include detailed daily macros (total distance covered, estimated cost for the day, the general vibe/theme of the day, weather forecast, packing tips, best time to start, and local customs).
- Ensure the packing tips are highly specific to the day's activities and the predicted weather. For example, if hiking is planned and it's cold, suggest warm layers and waterproof gear. If a beach day is planned, suggest sunscreen and swimwear.
- Ensure the entire response is in the requested language: ${language}.

Return ONLY JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert travel planner working for Itinno. Generate realistic travel itineraries.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            startingLocation: { type: Type.STRING },
            destination: { type: Type.STRING },
            budgetRs: { type: Type.NUMBER },
            language: { type: Type.STRING },
            travelOptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mode: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  cost: { type: Type.STRING },
                  description: { type: Type.STRING },
                  provider: { type: Type.STRING },
                  bookingLink: { type: Type.STRING },
                },
                required: ["mode", "duration", "cost", "description"],
              },
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  places: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        time_required: { type: Type.STRING },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                        type: { type: Type.STRING },
                        price: { type: Type.STRING },
                        bookingLink: { type: Type.STRING },
                        address: { type: Type.STRING },
                      },
                      required: ["name", "description", "time_required", "lat", "lng"],
                    },
                  },
                  food: { type: Type.STRING },
                  hotel: { type: Type.STRING },
                  transport_mode: { type: Type.STRING },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      totalDistance: { type: Type.STRING },
                      estimatedCost: { type: Type.STRING },
                      vibe: { type: Type.STRING },
                      weatherForecast: { type: Type.STRING },
                      packingTips: { type: Type.STRING },
                      bestTimeToStart: { type: Type.STRING },
                      localCustoms: { type: Type.STRING },
                    }
                  }
                },
                required: ["day", "places", "food", "hotel", "transport_mode"],
              },
            },
          },
          required: ["startingLocation", "destination", "budgetRs", "language", "travelOptions", "days"],
        },
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as Itinerary;
  } catch (error: any) {
    console.error("Error generating itinerary:", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED") {
      throw new Error("We are experiencing high traffic right now and our AI quota is temporarily exhausted. Please try again later.");
    }
    throw error;
  }
}

export async function generatePackingTips(
  destination: string,
  weather: string,
  activities: string[]
): Promise<string> {
  const prompt = `Generate highly specific and practical packing advice for a day trip in ${destination}.
Current Day's Weather: ${weather}
Planned Activities: ${activities.join(", ")}

Requirements:
- Provide 3-4 extremely specific tips.
- Link the advice directly to the activities and weather. 
- Example: "Since you're hiking in cold/rainy weather, pack moisture-wicking base layers, a waterproof outer shell, and sturdy boots with extra wool socks."
- Example: "For your beach day in the sun, bring high-SPF biodegradable sunscreen, a wide-brimmed hat, and a quick-dry towel."
- Keep it concise but descriptive.
- Return only the tips as a single, well-formatted string.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a travel packing expert.",
      },
    });
    return response.text || "Pack according to the weather and planned activities.";
  } catch (error) {
    console.error("Error generating packing tips:", error);
    return "Pack comfortable clothing and essentials for your trip.";
  }
}

export async function generateBudgetInsights(
  startingLocation: string,
  destination: string,
  budgetRs: number,
  days: number,
  travelers: number,
  travelType: string
): Promise<{ isSufficient: boolean; message: string; recommendedBudget: number }> {
  const prompt = `Analyze the following travel plan and provide budget insights:
Origin: ${startingLocation}
Destination: ${destination}
Budget: ₹${budgetRs} (Indian Rupees)
Duration: ${days} days
Travelers: ${travelers}
Travel Type: ${travelType}

Determine if the provided budget is sufficient for this trip. Consider flights/transport, accommodation, food, and activities for the specified travel type.
Return ONLY JSON with the following structure:
{
  "isSufficient": boolean (true if budget is enough, false if it's too low),
  "message": string (A helpful, encouraging message explaining why the budget is or isn't enough, and offering brief advice. Max 2-3 sentences.),
  "recommendedBudget": number (A realistic recommended budget in INR for this trip)
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert travel budget analyst.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSufficient: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
            recommendedBudget: { type: Type.NUMBER },
          },
          required: ["isSufficient", "message", "recommendedBudget"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error generating budget insights:", error);
    
    // Handle rate limit / quota exceeded errors
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED") {
      return {
        isSufficient: true,
        message: "AI budget analysis is currently unavailable due to high traffic. Please proceed with your planned budget.",
        recommendedBudget: budgetRs
      };
    }

    // Fallback
    return {
      isSufficient: true,
      message: "Unable to analyze budget at this time. Please proceed with caution.",
      recommendedBudget: budgetRs
    };
  }
}

export async function generateTravelImage(prompt: string, size: "512px" | "1K" | "2K" | "4K" = "1K"): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    console.error("Error generating image:", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED") {
      console.warn("Image generation skipped due to quota limits.");
    }
    return null;
  }
}

export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType,
          },
        },
        "Transcribe the following audio.",
      ],
    });
    return response.text || "";
  } catch (error: any) {
    console.error("Error transcribing audio:", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED") {
      return "Audio transcription is currently unavailable due to high traffic.";
    }
    return "Failed to transcribe audio.";
  }
}

export async function analyzeImage(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        prompt,
      ],
    });
    return response.text || "";
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED") {
      return "Image analysis is currently unavailable due to high traffic.";
    }
    return "Failed to analyze image.";
  }
}

export async function fetchPlaceDetails(placeName: string, destination: string): Promise<{ openingHours: string; userReviews: string; contactInfo: string; photoUrl?: string }> {
  try {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBoW3Y5kJu5x_YWuud7okWMwqbiyOaSyTo";
    const query = `${placeName} in ${destination}`;
    
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.regularOpeningHours,places.reviews,places.nationalPhoneNumber,places.websiteUri,places.photos'
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    const place = data.places?.[0];

    if (!place) {
      return {
        openingHours: "Not available",
        userReviews: "No reviews found.",
        contactInfo: "Not available"
      };
    }

    let openingHours = "Not available";
    if (place.regularOpeningHours?.weekdayDescriptions) {
      openingHours = place.regularOpeningHours.weekdayDescriptions.join('\n');
    }

    let userReviews = "No reviews found.";
    if (place.reviews && place.reviews.length > 0) {
      // Get top 2 reviews
      userReviews = place.reviews.slice(0, 2).map((r: any) => `"${r.text?.text || r.text}" - ${r.authorAttribution?.displayName || 'User'} (${r.rating}★)`).join('\n\n');
    }

    let contactInfoParts = [];
    if (place.nationalPhoneNumber) contactInfoParts.push(`Phone: ${place.nationalPhoneNumber}`);
    if (place.websiteUri) contactInfoParts.push(`Website: ${place.websiteUri}`);
    
    const contactInfo = contactInfoParts.length > 0 ? contactInfoParts.join('\n') : "Not available";

    let photoUrl;
    if (place.photos && place.photos.length > 0) {
      const photoName = place.photos[0].name;
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${GOOGLE_MAPS_API_KEY}`;
    }

    return {
      openingHours,
      userReviews,
      contactInfo,
      photoUrl
    };
  } catch (error) {
    console.error("Error fetching place details from Google Maps:", error);
    // Fallback to Gemini if Google Maps fails
    try {
      const prompt = `Provide detailed information for the place "${placeName}" located in or near "${destination}".
Include:
- Opening Hours (general or specific if known)
- A summary of typical user reviews (what people love or complain about)
- Contact Information (phone number, website, or email if publicly available, otherwise say "Not available")

Return ONLY JSON.`;

      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are a helpful travel assistant providing accurate details about places. Use the googleSearch tool to find the most up-to-date information.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              openingHours: { type: Type.STRING },
              userReviews: { type: Type.STRING },
              contactInfo: { type: Type.STRING },
            },
            required: ["openingHours", "userReviews", "contactInfo"],
          },
          tools: [{ googleSearch: {} }],
        },
      });

      const text = fallbackResponse.text;
      if (!text) {
        throw new Error("No response from Gemini");
      }

      return JSON.parse(text);
    } catch (fallbackError: any) {
      console.error("Error fetching place details from Gemini fallback:", fallbackError);
      if (fallbackError?.status === 429 || fallbackError?.message?.includes("429") || fallbackError?.message?.includes("RESOURCE_EXHAUSTED") || fallbackError?.status === "RESOURCE_EXHAUSTED") {
        console.warn("Place details fallback skipped due to quota limits.");
      }
      return {
        openingHours: "Not available",
        userReviews: "No reviews found.",
        contactInfo: "Not available"
      };
    }
  }
}

export async function generateSpeech(text: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Aoede' },
            },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error: any) {
    console.error("Error generating speech:", error);
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.status === "RESOURCE_EXHAUSTED") {
      console.warn("Speech generation skipped due to quota limits.");
    }
    return null;
  }
}

export async function playPCM(base64Data: string) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // PCM 16-bit, little-endian, mono
    const numSamples = bytes.length / 2;
    const audioBuffer = audioContext.createBuffer(1, numSamples, 24000);
    const channelData = audioBuffer.getChannelData(0);
    
    const dataView = new DataView(bytes.buffer);
    for (let i = 0; i < numSamples; i++) {
      channelData[i] = dataView.getInt16(i * 2, true) / 32768;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error("Error playing PCM audio:", error);
  }
}

export function createChatbot() {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a helpful travel assistant for Itinno. You can help users plan their trips, find information about destinations, and answer general travel questions.",
      tools: [{ googleSearch: {} }],
    },
  });
}
