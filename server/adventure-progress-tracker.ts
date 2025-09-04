import { Server as SocketIOServer } from 'socket.io';

export interface ProgressStep {
  step: number;
  totalSteps: number;
  percentage: number;
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

export class AdventureProgressTracker {
  private io: SocketIOServer;
  private userId: string;
  private roomName: string;

  constructor(io: SocketIOServer, userId: string) {
    this.io = io;
    this.userId = userId;
    this.roomName = `adventure-${userId}`;
  }

  private emitProgress(step: ProgressStep) {
    console.log(`[PROGRESS] ${step.percentage}% - ${step.title}`);
    this.io.to(this.roomName).emit('adventure-progress', step);
  }

  // Step 1: Starting generation
  start() {
    this.emitProgress({
      step: 1,
      totalSteps: 12,
      percentage: 5,
      title: "🎲 Invoking Creative Forces",
      description: "Ancient scrolls unfurl, preparing the narrative magic...",
      icon: "⚡",
      timestamp: new Date().toISOString()
    });
  }

  // Step 2: LLM initialization  
  initializingLLM() {
    this.emitProgress({
      step: 2,
      totalSteps: 12,
      percentage: 10,
      title: "🧙‍♂️ Consulting the Arcane Oracle",
      description: "The Oracle awakens from its millennial slumber to weave your story...",
      icon: "🔮",
      timestamp: new Date().toISOString()
    });
  }

  // Step 3: Generating core adventure
  generatingCore() {
    this.emitProgress({
      step: 3,
      totalSteps: 12,
      percentage: 20,
      title: "📜 Forging the Main Legend",
      description: "Pages of destiny come alive, creating the structure of your adventure...",
      icon: "✍️",
      timestamp: new Date().toISOString()
    });
  }

  // Step 4: Creating scenes
  generatingScenes() {
    this.emitProgress({
      step: 4,
      totalSteps: 12,
      percentage: 30,
      title: "🏰 Building Epic Locations",
      description: "Dungeons, temples and fortresses emerge from the mists of time...",
      icon: "🏛️",
      timestamp: new Date().toISOString()
    });
  }

  // Step 5: Creating NPCs
  generatingNPCs() {
    this.emitProgress({
      step: 5,
      totalSteps: 12,
      percentage: 40,
      title: "👥 Bringing Memorable Characters to Life",
      description: "Heroes, villains and allies gain consciousness and personality...",
      icon: "👑",
      timestamp: new Date().toISOString()
    });
  }

  // Step 6: Creating monsters
  generatingMonsters() {
    this.emitProgress({
      step: 6,
      totalSteps: 12,
      percentage: 50,
      title: "🐉 Awakening Legendary Creatures",
      description: "Ancient beasts emerge from shadows, ready for battle...",
      icon: "⚔️",
      timestamp: new Date().toISOString()
    });
  }

  // Step 7: Professional enhancements
  applyingEnhancements() {
    this.emitProgress({
      step: 7,
      totalSteps: 12,
      percentage: 60,
      title: "✨ Applying Master Enchantments",
      description: "Final touches of mastery elevate your adventure to excellence...",
      icon: "🌟",
      timestamp: new Date().toISOString()
    });
  }

  // Step 8: Starting image generation
  startingImages() {
    this.emitProgress({
      step: 8,
      totalSteps: 12,
      percentage: 70,
      title: "🎨 Summoning Spectral Artists",
      description: "Ethereal brushes begin to give visual form to your world...",
      icon: "🖼️",
      timestamp: new Date().toISOString()
    });
  }

  // Step 9: Generating monster images
  generatingMonsterImages(monsterName: string, current: number, total: number) {
    this.emitProgress({
      step: 9,
      totalSteps: 12,
      percentage: 75 + (current / total) * 10,
      title: `🐲 Materializing: ${monsterName}`,
      description: `Giving visual form to legendary creatures (${current}/${total})...`,
      icon: "👹",
      timestamp: new Date().toISOString()
    });
  }

  // Step 10: Generating scene images
  generatingSceneImages(sceneName: string, current: number, total: number) {
    this.emitProgress({
      step: 10,
      totalSteps: 12,
      percentage: 85 + (current / total) * 10,
      title: `🏞️ Illustrating: ${sceneName}`,
      description: `Capturing the majesty of each location (${current}/${total})...`,
      icon: "🏔️",
      timestamp: new Date().toISOString()
    });
  }

  // Step 11: Saving to database
  savingAdventure() {
    this.emitProgress({
      step: 11,
      totalSteps: 12,
      percentage: 95,
      title: "📚 Inscribing in the Eternal Archives",
      description: "Your adventure is saved in the immortal annals of history...",
      icon: "💾",
      timestamp: new Date().toISOString()
    });
  }

  // Step 12: Completion
  complete(adventureTitle: string) {
    this.emitProgress({
      step: 12,
      totalSteps: 12,
      percentage: 100,
      title: `🎉 ${adventureTitle} is Ready!`,
      description: "Your epic adventure has come to life. Let the legend begin!",
      icon: "🏆",
      timestamp: new Date().toISOString()
    });
  }

  // Error handling
  error(message: string) {
    this.emitProgress({
      step: -1,
      totalSteps: 12,
      percentage: 0,
      title: "⚠️ The Gods of Chaos Intervene",
      description: `An arcane setback has occurred: ${message}`,
      icon: "💥",
      timestamp: new Date().toISOString()
    });
  }
}