import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

export interface GalleryFilters {
  gameSystem?: string;
  playerLevel?: string;
  duration?: string;
  tone?: string;
  setting?: string;
  themes?: string[];
  search?: string;
  sortBy?: 'newest' | 'popular' | 'rating' | 'downloads';
}

interface GalleryFiltersProps {
  filters: GalleryFilters;
  onFiltersChange: (filters: GalleryFilters) => void;
  onClearFilters: () => void;
}

const GAME_SYSTEMS = [
  { value: 'dnd5e', label: 'D&D 5th Edition' },
  { value: 'pathfinder2e', label: 'Pathfinder 2e' },
  { value: 'other', label: 'Other Systems' }
];

const PLAYER_LEVELS = [
  { value: '1-3', label: 'Level 1-3 (Beginners)' },
  { value: '4-6', label: 'Level 4-6 (Adventurers)' },
  { value: '7-10', label: 'Level 7-10 (Heroes)' },
  { value: '11-15', label: 'Level 11-15 (Champions)' },
  { value: '16-20', label: 'Level 16-20 (Legends)' }
];

const DURATIONS = [
  { value: 'one-shot', label: 'One-shot (1 session)' },
  { value: 'short', label: 'Short adventure (2-3 sessions)' },
  { value: 'medium', label: 'Mini-campaign (4-8 sessions)' },
  { value: 'long', label: 'Long campaign (9+ sessions)' }
];

const TONES = [
  { value: 'heroic', label: 'Heroic' },
  { value: 'dark', label: 'Dark' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'political', label: 'Political' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'epic', label: 'Epic' }
];

const SETTINGS = [
  { value: 'urban', label: 'Urban' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'wilderness', label: 'Wilderness' },
  { value: 'planar', label: 'Planar' },
  { value: 'nautical', label: 'Nautical' },
  { value: 'underground', label: 'Underground' }
];

const THEMES = [
  'Dragons', 'Ancient Magic', 'Politics', 'Romance', 
  'Betrayal', 'Redemption', 'Revenge', 'Mystery',
  'Horror', 'Comedy', 'War', 'Exploration'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'downloads', label: 'Most Downloaded' }
];

export function GalleryFilters({ filters, onFiltersChange, onClearFilters }: GalleryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const updateFilter = (key: keyof GalleryFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleTheme = (theme: string) => {
    const currentThemes = filters.themes || [];
    const newThemes = currentThemes.includes(theme)
      ? currentThemes.filter(t => t !== theme)
      : [...currentThemes, theme];
    
    updateFilter('themes', newThemes);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchValue);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.gameSystem) count++;
    if (filters.playerLevel) count++;
    if (filters.duration) count++;
    if (filters.tone) count++;
    if (filters.setting) count++;
    if (filters.themes && filters.themes.length > 0) count++;
    if (filters.search) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search adventures..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Sort */}
          <div className="flex gap-2">
            <Select value={filters.sortBy || 'newest'} onValueChange={(value) => updateFilter('sortBy', value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="relative">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                  {/* Game System */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Game System</label>
                    <Select value={filters.gameSystem || ''} onValueChange={(value) => updateFilter('gameSystem', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any system</SelectItem>
                        {GAME_SYSTEMS.map(system => (
                          <SelectItem key={system.value} value={system.value}>
                            {system.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Player Level */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Player Level</label>
                    <Select value={filters.playerLevel || ''} onValueChange={(value) => updateFilter('playerLevel', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any level</SelectItem>
                        {PLAYER_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration</label>
                    <Select value={filters.duration || ''} onValueChange={(value) => updateFilter('duration', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any duration</SelectItem>
                        {DURATIONS.map(duration => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <Select value={filters.tone || ''} onValueChange={(value) => updateFilter('tone', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any tone</SelectItem>
                        {TONES.map(tone => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Setting */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Setting</label>
                    <Select value={filters.setting || ''} onValueChange={(value) => updateFilter('setting', value || undefined)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any setting" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any setting</SelectItem>
                        {SETTINGS.map(setting => (
                          <SelectItem key={setting.value} value={setting.value}>
                            {setting.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Themes */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium mb-2 block">Themes</label>
                    <div className="flex flex-wrap gap-2">
                      {THEMES.map(theme => (
                        <Button
                          key={theme}
                          variant={filters.themes?.includes(theme) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTheme(theme)}
                          className="h-8"
                        >
                          {theme}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={onClearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    setSearchValue('');
                    updateFilter('search', undefined);
                  }}
                />
              </Badge>
            )}
            {filters.gameSystem && (
              <Badge variant="secondary" className="gap-1">
                {GAME_SYSTEMS.find(s => s.value === filters.gameSystem)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('gameSystem', undefined)}
                />
              </Badge>
            )}
            {filters.playerLevel && (
              <Badge variant="secondary" className="gap-1">
                {PLAYER_LEVELS.find(l => l.value === filters.playerLevel)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('playerLevel', undefined)}
                />
              </Badge>
            )}
            {filters.duration && (
              <Badge variant="secondary" className="gap-1">
                {DURATIONS.find(d => d.value === filters.duration)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('duration', undefined)}
                />
              </Badge>
            )}
            {filters.tone && (
              <Badge variant="secondary" className="gap-1">
                {TONES.find(t => t.value === filters.tone)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('tone', undefined)}
                />
              </Badge>
            )}
            {filters.setting && (
              <Badge variant="secondary" className="gap-1">
                {SETTINGS.find(s => s.value === filters.setting)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('setting', undefined)}
                />
              </Badge>
            )}
            {filters.themes?.map(theme => (
              <Badge key={theme} variant="secondary" className="gap-1">
                {theme}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTheme(theme)}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}