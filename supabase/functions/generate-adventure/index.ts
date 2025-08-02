import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-ADVENTURE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Initialize Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseService.auth.getUser(token);
    if (userError || !userData.user) throw new Error('User not authenticated');

    const { prompt, gameSystem = 'dnd5e' } = await req.json();
    if (!prompt) throw new Error('Prompt is required');

    logStep("Received request", { userId: userData.user.id, prompt: prompt.substring(0, 100) });

    // Check user's credits
    const { data: profile } = await supabaseService
      .from('profiles')
      .select('credits_remaining, subscription_tier')
      .eq('user_id', userData.user.id)
      .single();

    if (!profile || profile.credits_remaining <= 0) {
      throw new Error('Insufficient credits. Please upgrade your plan or purchase more credits.');
    }

    // Generate the adventure using OpenAI
    const adventureContent = await generateAdventure(openAIApiKey, prompt, gameSystem);
    logStep("Adventure generated", { title: adventureContent.title });

    // Generate images for monsters and items
    const imageUrls = await generateImages(openAIApiKey, adventureContent);
    logStep("Images generated", { count: imageUrls.length });

    // Save to database
    const { data: adventure, error: saveError } = await supabaseService
      .from('adventures')
      .insert({
        user_id: userData.user.id,
        title: adventureContent.title,
        description: adventureContent.summary,
        content: adventureContent,
        image_urls: imageUrls,
        game_system: gameSystem,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    // Update user credits
    await supabaseService
      .from('profiles')
      .update({ 
        credits_remaining: profile.credits_remaining - 1,
        monthly_generations: (profile.monthly_generations || 0) + 1
      })
      .eq('user_id', userData.user.id);

    logStep("Adventure saved and credits updated");

    return new Response(JSON.stringify({
      adventure,
      content: adventureContent,
      imageUrls
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAdventure(apiKey: string, prompt: string, gameSystem: string) {
  const systemPrompt = `You are a master Game Master for ${gameSystem} TTRPG. Generate a complete adventure based on the user's prompt. 

Return a JSON object with this exact structure:
{
  "title": "Adventure Title",
  "summary": "Brief 2-3 sentence summary",
  "backgroundStory": "Detailed background and setup",
  "plotHooks": ["Hook 1", "Hook 2", "Hook 3"],
  "scenes": [
    {
      "title": "Scene Title",
      "description": "Detailed scene description",
      "objectives": ["Objective 1", "Objective 2"],
      "challenges": "Challenges and obstacles"
    }
  ],
  "npcs": [
    {
      "name": "NPC Name",
      "role": "Their role in the story",
      "personality": "Key personality traits",
      "motivation": "What drives them"
    }
  ],
  "monsters": [
    {
      "name": "Monster Name",
      "description": "Detailed physical description for art generation",
      "challenge_rating": "CR level",
      "abilities": ["Special ability 1", "Special ability 2"],
      "tactics": "How they fight"
    }
  ],
  "magicItems": [
    {
      "name": "Item Name",
      "description": "Detailed visual description for art generation",
      "rarity": "Common/Uncommon/Rare/Very Rare/Legendary",
      "properties": "What it does mechanically"
    }
  ],
  "rewards": {
    "experience": "XP breakdown",
    "treasure": "Gold and valuables",
    "other": "Special rewards"
  }
}

Make it engaging, detailed, and ready to play!`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateImages(apiKey: string, adventure: any): Promise<string[]> {
  const imageUrls: string[] = [];
  
  try {
    // Generate images for monsters
    for (const monster of adventure.monsters || []) {
      try {
        const imagePrompt = `Fantasy art, ${monster.description}, detailed digital illustration, dramatic lighting, high quality`;
        const imageUrl = await generateSingleImage(apiKey, imagePrompt);
        if (imageUrl) imageUrls.push(imageUrl);
      } catch (error) {
        console.log(`Failed to generate image for monster ${monster.name}:`, error);
      }
    }

    // Generate images for magic items
    for (const item of adventure.magicItems || []) {
      try {
        const imagePrompt = `Fantasy magic item, ${item.description}, ornate design, glowing magical aura, detailed illustration`;
        const imageUrl = await generateSingleImage(apiKey, imagePrompt);
        if (imageUrl) imageUrls.push(imageUrl);
      } catch (error) {
        console.log(`Failed to generate image for item ${item.name}:`, error);
      }
    }
  } catch (error) {
    console.log('Error generating images:', error);
  }

  return imageUrls;
}

async function generateSingleImage(apiKey: string, prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'high'
      }),
    });

    if (!response.ok) {
      throw new Error(`Image API error: ${response.statusText}`);
    }

    const data = await response.json();
    // For gpt-image-1, the response comes as base64
    return data.data[0].b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data[0].url;
  } catch (error) {
    console.log('Error generating single image:', error);
    return null;
  }
}