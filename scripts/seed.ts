import { faker } from '@faker-js/faker';
import { createClient } from '@supabase/supabase-js';
import { SEEDER_CONFIG, validateConfig } from './seed-config';

// Initialize Supabase client
const supabase = createClient(
  SEEDER_CONFIG.SUPABASE_URL,
  SEEDER_CONFIG.SUPABASE_SERVICE_ROLE_KEY
);

// Types for our data
interface SeedUser {
  id: string;
  email: string;
  display_name: string;
  subscription_tier: 'free' | 'scribe' | 'archmage';
  credits_remaining: number;
  monthly_generations: number;
}

interface SeedAdventure {
  user_id: string;
  title: string;
  description: string;
  content: any;
  image_urls: string[];
  game_system: string;
  is_public: boolean;
}

interface SeedInviteCode {
  code: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
}

// Adventure content templates
const adventureTemplates = [
  {
    title: "The Cursed Lighthouse",
    description: "A mysterious lighthouse that appears only during storms, hiding dark secrets beneath its flickering light.",
    game_system: "dnd5e",
    content: {
      title: "The Cursed Lighthouse",
      summary: "A lighthouse keeper's ghost warns ships of a greater danger lurking beneath the waves.",
      backgroundStory: "The lighthouse of Storm's End has stood for centuries, but recently its light has begun to flicker with an unnatural glow. Local fishermen speak of strange sounds emanating from the structure during storms, and several ships have disappeared near its rocky shores.",
      plotHooks: [
        "The party is hired to investigate the lighthouse's strange behavior",
        "A merchant ship carrying valuable cargo has gone missing near the lighthouse",
        "The local fishing village is being terrorized by creatures emerging from the sea"
      ],
      scenes: [
        {
          title: "Arrival at Storm's End",
          description: "The party arrives at the small fishing village to find it in a state of fear and paranoia.",
          objectives: ["Gather information about the lighthouse", "Find a guide to take them to the structure"],
          challenges: "The villagers are reluctant to speak and the weather is turning foul."
        },
        {
          title: "The Lighthouse Approach",
          description: "Navigating the treacherous rocks to reach the lighthouse reveals signs of recent activity.",
          objectives: ["Reach the lighthouse safely", "Investigate the signs of recent activity"],
          challenges: "The rocks are slippery and the waves are dangerous."
        }
      ],
      npcs: [
        {
          name: "Captain Elias Stormwind",
          role: "Retired sea captain and local historian",
          personality: "Gruff but knowledgeable, carries a heavy burden of guilt",
          motivation: "Wants to protect the village from the lighthouse's curse"
        },
        {
          name: "Marina the Fishwife",
          role: "Local merchant and information broker",
          personality: "Sharp-tongued but helpful, knows everyone's business",
          motivation: "Wants to restore normal trade to the village"
        }
      ],
      monsters: [
        {
          name: "Drowned Sailor",
          description: "A spectral figure with seaweed-covered clothing and glowing eyes",
          challenge_rating: "3",
          abilities: ["Incorporeal movement", "Drowning touch", "Siren's call"],
          tactics: "Uses the environment to their advantage, luring victims into the water"
        }
      ],
      magicItems: [
        {
          name: "Lighthouse Keeper's Lantern",
          description: "An ornate brass lantern that glows with an otherworldly light",
          rarity: "Rare",
          properties: "Can reveal hidden creatures and dispel illusions"
        }
      ],
      rewards: {
        experience: "1,200 XP for completing the adventure",
        treasure: "500 gold pieces and the Lighthouse Keeper's Lantern",
        other: "The gratitude of the village and a permanent discount on supplies"
      }
    }
  },
  {
    title: "The Carnival of Shadows",
    description: "A traveling carnival that appears only during the new moon, hiding dark secrets about the townsfolk who never return.",
    game_system: "dnd5e",
    content: {
      title: "The Carnival of Shadows",
      summary: "A mysterious carnival arrives in town during the new moon, but those who visit never return the same.",
      backgroundStory: "The Carnival of Shadows has been traveling the land for generations, appearing only during the darkest nights. Each town it visits is left changed forever, with some residents disappearing entirely and others returning as hollow shells of their former selves.",
      plotHooks: [
        "The carnival has arrived in the party's hometown",
        "A loved one has gone missing after visiting the carnival",
        "The party is hired to investigate the carnival's true nature"
      ],
      scenes: [
        {
          title: "The Carnival Gates",
          description: "The party approaches the carnival's ornate gates, which seem to shift and change in the moonlight.",
          objectives: ["Enter the carnival", "Find information about the missing people"],
          challenges: "The carnival's magic makes it difficult to navigate and remember directions."
        }
      ],
      npcs: [
        {
          name: "Madame Fortuna",
          role: "Carnival fortune teller and ringmaster",
          personality: "Mysterious and alluring, speaks in riddles and half-truths",
          motivation: "Seeks to feed the carnival's insatiable hunger for souls"
        }
      ],
      monsters: [
        {
          name: "Shadow Clown",
          description: "A figure made of living shadows with a painted smile that never fades",
          challenge_rating: "4",
          abilities: ["Shadow step", "Terrifying laughter", "Soul drain"],
          tactics: "Uses fear and confusion to separate victims from the group"
        }
      ],
      magicItems: [
        {
          name: "Mirror of Truth",
          description: "A handheld mirror that shows the true form of those reflected in it",
          rarity: "Uncommon",
          properties: "Reveals illusions and hidden creatures"
        }
      ],
      rewards: {
        experience: "1,500 XP for surviving the carnival",
        treasure: "800 gold pieces and the Mirror of Truth",
        other: "Freedom for the carnival's victims and the gratitude of the town"
      }
    }
  },
  {
    title: "The Living Library",
    description: "An ancient library where books come alive at night and the party must solve a riddle to prevent knowledge from being lost forever.",
    game_system: "dnd5e",
    content: {
      title: "The Living Library",
      summary: "An ancient library's books have come to life, and the party must solve a riddle to prevent knowledge from being lost forever.",
      backgroundStory: "The Great Library of Alexandria was thought to be lost to time, but it has reappeared in a remote mountain valley. The library's ancient magic has awakened, bringing the books to life and creating a maze of knowledge that must be navigated carefully.",
      plotHooks: [
        "The party seeks a specific piece of lost knowledge",
        "A scholar has gone missing while researching in the library",
        "The library's magic is spreading and affecting nearby settlements"
      ],
      scenes: [
        {
          title: "The Library's Entrance",
          description: "The party approaches the massive stone library, its doors covered in ancient runes that glow with magical energy.",
          objectives: ["Decipher the entrance runes", "Enter the library safely"],
          challenges: "The runes are written in an ancient language and the doors are magically sealed."
        }
      ],
      npcs: [
        {
          name: "Librarian Thoth",
          role: "Ancient guardian of the library",
          personality: "Wise but cryptic, speaks in riddles and ancient wisdom",
          motivation: "Protects the library's knowledge and tests worthy visitors"
        }
      ],
      monsters: [
        {
          name: "Living Grimoire",
          description: "A massive book with animated pages and a mouth full of sharp teeth",
          challenge_rating: "5",
          abilities: ["Paper cut", "Knowledge drain", "Summon paper minions"],
          tactics: "Uses the library's maze-like structure to ambush and confuse intruders"
        }
      ],
      magicItems: [
        {
          name: "Quill of Knowledge",
          description: "A magical quill that can write any spell once per day",
          rarity: "Very Rare",
          properties: "Allows the user to cast any spell they've seen written down"
        }
      ],
      rewards: {
        experience: "2,000 XP for solving the library's mysteries",
        treasure: "1,200 gold pieces and the Quill of Knowledge",
        other: "Access to the library's vast collection of knowledge"
      }
    }
  }
];

// Generate realistic user data
function generateUsers(count: number): SeedUser[] {
  const users: SeedUser[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const displayName = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName });
    
    // Distribute users across subscription tiers
    const tierRoll = Math.random();
    let subscription_tier: 'free' | 'scribe' | 'archmage';
    let credits_remaining: number;
    let monthly_generations: number;
    
    if (tierRoll < SEEDER_CONFIG.FREE_USER_PERCENTAGE) {
      subscription_tier = 'free';
      credits_remaining = Math.floor(Math.random() * 5) + 1;
      monthly_generations = Math.floor(Math.random() * 3);
    } else if (tierRoll < SEEDER_CONFIG.FREE_USER_PERCENTAGE + SEEDER_CONFIG.SCRIBE_USER_PERCENTAGE) {
      subscription_tier = 'scribe';
      credits_remaining = Math.floor(Math.random() * 50) + 10;
      monthly_generations = Math.floor(Math.random() * 20) + 5;
    } else {
      subscription_tier = 'archmage';
      credits_remaining = Math.floor(Math.random() * 200) + 50;
      monthly_generations = Math.floor(Math.random() * 100) + 20;
    }
    
    users.push({
      id: faker.string.uuid(),
      email,
      display_name: displayName,
      subscription_tier,
      credits_remaining,
      monthly_generations
    });
  }
  
  return users;
}

// Generate realistic adventures
function generateAdventures(users: SeedUser[], count: number): SeedAdventure[] {
  const adventures: SeedAdventure[] = [];
  
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const template = adventureTemplates[Math.floor(Math.random() * adventureTemplates.length)];
    
    // Add some variation to the template
    const content = {
      ...template.content,
      title: faker.helpers.arrayElement([
        template.title,
        `${template.title} - ${faker.word.adjective()} Edition`,
        `The ${faker.word.adjective()} ${template.title.split(' ').slice(1).join(' ')}`
      ])
    };
    
    // Generate some fake image URLs
    const imageCount = Math.floor(Math.random() * (SEEDER_CONFIG.IMAGES_PER_ADVENTURE_MAX - SEEDER_CONFIG.IMAGES_PER_ADVENTURE_MIN + 1)) + SEEDER_CONFIG.IMAGES_PER_ADVENTURE_MIN;
    const imageUrls = Array.from({ length: imageCount }, () => 
      faker.image.urlLoremFlickr({ category: 'fantasy' })
    );
    
    adventures.push({
      user_id: user.id,
      title: content.title,
      description: content.summary,
      content,
      image_urls: imageUrls,
      game_system: template.game_system,
      is_public: Math.random() < SEEDER_CONFIG.PUBLIC_ADVENTURE_PERCENTAGE
    });
  }
  
  return adventures;
}

// Generate invite codes
function generateInviteCodes(count: number): SeedInviteCode[] {
  const codes: SeedInviteCode[] = [];
  
  for (let i = 0; i < count; i++) {
    const maxUses = Math.floor(Math.random() * 5) + 1;
    const currentUses = Math.floor(Math.random() * maxUses);
    const isActive = Math.random() < SEEDER_CONFIG.ACTIVE_INVITE_CODES_PERCENTAGE;
    
    codes.push({
      code: faker.string.alphanumeric(8).toUpperCase(),
      max_uses: maxUses,
      current_uses: currentUses,
      is_active: isActive,
      expires_at: Math.random() < SEEDER_CONFIG.EXPIRING_INVITE_CODES_PERCENTAGE ? faker.date.future().toISOString() : null
    });
  }
  
  return codes;
}

// Main seeding function
async function seed() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Validate configuration
    validateConfig();
    
    // Generate data
    const users = generateUsers(SEEDER_CONFIG.USERS_COUNT);
    const adventures = generateAdventures(users, SEEDER_CONFIG.ADVENTURES_COUNT);
    const inviteCodes = generateInviteCodes(SEEDER_CONFIG.INVITE_CODES_COUNT);
    
    console.log(`📊 Generated ${users.length} users, ${adventures.length} adventures, ${inviteCodes.length} invite codes`);
    
    // Insert users (profiles)
    console.log('👥 Inserting users...');
    for (const user of users) {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          display_name: user.display_name,
          subscription_tier: user.subscription_tier,
          credits_remaining: user.credits_remaining,
          monthly_generations: user.monthly_generations,
          created_at: faker.date.past(),
          updated_at: faker.date.recent()
        });
      
      if (error) {
        console.error('Error inserting user:', error);
      }
    }
    
    // Insert adventures
    console.log('📚 Inserting adventures...');
    for (const adventure of adventures) {
      const { error } = await supabase
        .from('adventures')
        .insert({
          user_id: adventure.user_id,
          title: adventure.title,
          description: adventure.description,
          content: adventure.content,
          image_urls: adventure.image_urls,
          game_system: adventure.game_system,
          is_public: adventure.is_public,
          created_at: faker.date.past(),
          updated_at: faker.date.recent()
        });
      
      if (error) {
        console.error('Error inserting adventure:', error);
      }
    }
    
    // Insert invite codes
    console.log('🔑 Inserting invite codes...');
    for (const code of inviteCodes) {
      const { error } = await supabase
        .from('invite_codes')
        .insert({
          code: code.code,
          max_uses: code.max_uses,
          current_uses: code.current_uses,
          is_active: code.is_active,
          expires_at: code.expires_at,
          created_at: faker.date.past()
        });
      
      if (error) {
        console.error('Error inserting invite code:', error);
      }
    }
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`- ${users.length} users created`);
    console.log(`- ${adventures.length} adventures created`);
    console.log(`- ${inviteCodes.length} invite codes created`);
    
    // Show some sample data
    console.log('\n🎭 Sample Users:');
    users.slice(0, 3).forEach(user => {
      console.log(`  - ${user.display_name} (${user.email}) - ${user.subscription_tier} plan`);
    });
    
    console.log('\n📖 Sample Adventures:');
    adventures.slice(0, 3).forEach(adventure => {
      console.log(`  - "${adventure.title}" by ${users.find(u => u.id === adventure.user_id)?.display_name}`);
    });
    
    console.log('\n🔑 Sample Invite Codes:');
    inviteCodes.slice(0, 3).forEach(code => {
      console.log(`  - ${code.code} (${code.current_uses}/${code.max_uses} uses) - ${code.is_active ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// Run the seeder
seed();

export { seed }; 