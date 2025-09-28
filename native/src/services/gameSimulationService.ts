// Game Simulation Service for ParlayParty
// Handles AI-powered NFL game simulation

export interface NFLTeam {
  name: string;
  abbreviation: string;
  city: string;
}

export interface NFLPlayer {
  name: string;
  position: string;
  team: string;
}

export interface GamePlay {
  timestamp_seconds: number;
  quarter: number;
  game_clock: string;
  down: number | null;
  distance: number | null;
  yard_line: number;
  possessing_team: string;
  description: string;
  involved_players: string[];
  team_A_score: number;
  team_B_score: number;
}

export interface GameFinal {
  event_type: "GAME_FINAL";
  final_score: {
    [teamAbbr: string]: number;
  };
  winning_team: string;
  player_A_final_stats: string;
  player_B_final_stats: string;
}

export type GameScript = (GamePlay | GameFinal)[];

export interface PlayerStats {
  passing_yards: number;
  passing_tds: number;
  rushing_yards: number;
  rushing_tds: number;
  receiving_yards: number;
  receiving_tds: number;
  receptions: number;
}

export interface PlayerProp {
  player: string;
  position: string;
  team: string;
  prop: string;
  line: number;
  type: string;
  overUnder: 'Over' | 'Under';
}

export interface SimulationGame {
  teamA: NFLTeam;
  teamB: NFLTeam;
  playerA: PlayerProp;
  playerB: PlayerProp;
  gameScript: GameScript;
}

// NFL Teams Data
export const NFL_TEAMS: NFLTeam[] = [
  { name: "Chiefs", abbreviation: "KC", city: "Kansas City" },
  { name: "Bills", abbreviation: "BUF", city: "Buffalo" },
  { name: "49ers", abbreviation: "SF", city: "San Francisco" },
  { name: "Cowboys", abbreviation: "DAL", city: "Dallas" },
  { name: "Eagles", abbreviation: "PHI", city: "Philadelphia" },
  { name: "Giants", abbreviation: "NYG", city: "New York" },
  { name: "Dolphins", abbreviation: "MIA", city: "Miami" },
  { name: "Patriots", abbreviation: "NE", city: "New England" },
  { name: "Ravens", abbreviation: "BAL", city: "Baltimore" },
  { name: "Bengals", abbreviation: "CIN", city: "Cincinnati" },
  { name: "Steelers", abbreviation: "PIT", city: "Pittsburgh" },
  { name: "Browns", abbreviation: "CLE", city: "Cleveland" },
  { name: "Colts", abbreviation: "IND", city: "Indianapolis" },
  { name: "Titans", abbreviation: "TEN", city: "Tennessee" },
  { name: "Jaguars", abbreviation: "JAX", city: "Jacksonville" },
  { name: "Texans", abbreviation: "HOU", city: "Houston" },
  { name: "Broncos", abbreviation: "DEN", city: "Denver" },
  { name: "Chargers", abbreviation: "LAC", city: "Los Angeles" },
  { name: "Raiders", abbreviation: "LV", city: "Las Vegas" },
  { name: "Jets", abbreviation: "NYJ", city: "New York" },
  { name: "Packers", abbreviation: "GB", city: "Green Bay" },
  { name: "Vikings", abbreviation: "MIN", city: "Minnesota" },
  { name: "Lions", abbreviation: "DET", city: "Detroit" },
  { name: "Bears", abbreviation: "CHI", city: "Chicago" },
  { name: "Falcons", abbreviation: "ATL", city: "Atlanta" },
  { name: "Saints", abbreviation: "NO", city: "New Orleans" },
  { name: "Panthers", abbreviation: "CAR", city: "Carolina" },
  { name: "Buccaneers", abbreviation: "TB", city: "Tampa Bay" },
  { name: "Cardinals", abbreviation: "ARI", city: "Arizona" },
  { name: "Rams", abbreviation: "LAR", city: "Los Angeles" },
  { name: "Seahawks", abbreviation: "SEA", city: "Seattle" },
  { name: "Commanders", abbreviation: "WAS", city: "Washington" }
];

// NFL Players Data (Star players for each position)
export const NFL_PLAYERS: NFLPlayer[] = [
  // Quarterbacks
  { name: "Patrick Mahomes", position: "QB", team: "KC" },
  { name: "Josh Allen", position: "QB", team: "BUF" },
  { name: "Lamar Jackson", position: "QB", team: "BAL" },
  { name: "Joe Burrow", position: "QB", team: "CIN" },
  { name: "Dak Prescott", position: "QB", team: "DAL" },
  { name: "Jalen Hurts", position: "QB", team: "PHI" },
  { name: "Tua Tagovailoa", position: "QB", team: "MIA" },
  { name: "Justin Herbert", position: "QB", team: "LAC" },
  { name: "Trevor Lawrence", position: "QB", team: "JAX" },
  { name: "Aaron Rodgers", position: "QB", team: "NYJ" },
  
  // Running Backs
  { name: "Christian McCaffrey", position: "RB", team: "SF" },
  { name: "Derrick Henry", position: "RB", team: "TEN" },
  { name: "Nick Chubb", position: "RB", team: "CLE" },
  { name: "Saquon Barkley", position: "RB", team: "NYG" },
  { name: "Austin Ekeler", position: "RB", team: "LAC" },
  { name: "Josh Jacobs", position: "RB", team: "LV" },
  { name: "Tony Pollard", position: "RB", team: "DAL" },
  { name: "Rhamondre Stevenson", position: "RB", team: "NE" },
  { name: "Travis Etienne", position: "RB", team: "JAX" },
  { name: "Breece Hall", position: "RB", team: "NYJ" },
  
  // Wide Receivers
  { name: "Tyreek Hill", position: "WR", team: "MIA" },
  { name: "Davante Adams", position: "WR", team: "LV" },
  { name: "Stefon Diggs", position: "WR", team: "BUF" },
  { name: "Cooper Kupp", position: "WR", team: "LAR" },
  { name: "Ja'Marr Chase", position: "WR", team: "CIN" },
  { name: "A.J. Brown", position: "WR", team: "PHI" },
  { name: "CeeDee Lamb", position: "WR", team: "DAL" },
  { name: "DK Metcalf", position: "WR", team: "SEA" },
  { name: "Mike Evans", position: "WR", team: "TB" },
  { name: "DeAndre Hopkins", position: "WR", team: "ARI" },
  
  // Tight Ends
  { name: "Travis Kelce", position: "TE", team: "KC" },
  { name: "Mark Andrews", position: "TE", team: "BAL" },
  { name: "George Kittle", position: "TE", team: "SF" },
  { name: "Darren Waller", position: "TE", team: "NYG" },
  { name: "Kyle Pitts", position: "TE", team: "ATL" },
  { name: "T.J. Hockenson", position: "TE", team: "MIN" },
  { name: "Evan Engram", position: "TE", team: "JAX" },
  { name: "Dallas Goedert", position: "TE", team: "PHI" },
  { name: "Pat Freiermuth", position: "TE", team: "PIT" },
  { name: "Dalton Schultz", position: "TE", team: "HOU" }
];

// Player Props Templates with realistic lines - ONLY trackable types
export const PLAYER_PROP_TEMPLATES = {
  QB: [
    { prop: "Passing Yards", line: 250.5, type: "passing_yards" },
    { prop: "Passing Yards", line: 275.5, type: "passing_yards" },
    { prop: "Passing Yards", line: 300.5, type: "passing_yards" },
    { prop: "Passing Touchdowns", line: 1.5, type: "passing_tds" },
    { prop: "Passing Touchdowns", line: 2.5, type: "passing_tds" }
  ],
  RB: [
    { prop: "Rushing Yards", line: 60.5, type: "rushing_yards" },
    { prop: "Rushing Yards", line: 75.5, type: "rushing_yards" },
    { prop: "Rushing Yards", line: 90.5, type: "rushing_yards" },
    { prop: "Rushing Touchdowns", line: 0.5, type: "rushing_tds" },
    { prop: "Rushing Touchdowns", line: 1.5, type: "rushing_tds" }
  ],
  WR: [
    { prop: "Receiving Yards", line: 50.5, type: "receiving_yards" },
    { prop: "Receiving Yards", line: 65.5, type: "receiving_yards" },
    { prop: "Receiving Yards", line: 80.5, type: "receiving_yards" },
    { prop: "Receiving Touchdowns", line: 0.5, type: "receiving_tds" },
    { prop: "Receiving Touchdowns", line: 1.5, type: "receiving_tds" }
  ],
  TE: [
    { prop: "Receiving Yards", line: 35.5, type: "receiving_yards" },
    { prop: "Receiving Yards", line: 45.5, type: "receiving_yards" },
    { prop: "Receiving Touchdowns", line: 0.5, type: "receiving_tds" },
    { prop: "Receiving Touchdowns", line: 1.5, type: "receiving_tds" }
  ]
};

export class GameSimulationService {
  private static readonly OPENAI_API_KEY = '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';
  private static readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  /**
   * Generate a game simulation with specific teams (for consistency with dummy data)
   */
  static async generateGameSimulationWithTeams(teamA: NFLTeam, teamB: NFLTeam): Promise<SimulationGame> {
    // Select players from the specified teams
    const teamAPlayers = NFL_PLAYERS.filter(p => p.team === teamA.abbreviation);
    const teamBPlayers = NFL_PLAYERS.filter(p => p.team === teamB.abbreviation);

    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      throw new Error(`No players found for teams ${teamA.abbreviation} or ${teamB.abbreviation}`);
    }

    const playerA = teamAPlayers[Math.floor(Math.random() * teamAPlayers.length)];
    const playerB = teamBPlayers[Math.floor(Math.random() * teamBPlayers.length)];

    // Generate player props
    const playerAProp = this.generatePlayerProp(playerA);
    const playerBProp = this.generatePlayerProp(playerB);

    // Generate AI game script
    const gameScript = await this.generateGameScript(teamA, teamB, playerA, playerB);

    return {
      teamA,
      teamB,
      playerA: playerAProp,
      playerB: playerBProp,
      gameScript
    };
  }

  /**
   * Generate a random NFL game simulation
   */
  static async generateGameSimulation(): Promise<SimulationGame> {
    // Randomly select two teams
    const shuffledTeams = [...NFL_TEAMS].sort(() => Math.random() - 0.5);
    const teamA = shuffledTeams[0];
    const teamB = shuffledTeams[1];

    // Select players from each team
    const teamAPlayers = NFL_PLAYERS.filter(p => p.team === teamA.abbreviation);
    const teamBPlayers = NFL_PLAYERS.filter(p => p.team === teamB.abbreviation);

    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      throw new Error('No players found for selected teams');
    }

    const playerA = teamAPlayers[Math.floor(Math.random() * teamAPlayers.length)];
    const playerB = teamBPlayers[Math.floor(Math.random() * teamBPlayers.length)];

    // Generate player props
    const playerAProp = this.generatePlayerProp(playerA);
    const playerBProp = this.generatePlayerProp(playerB);

    // Generate AI game script
    const gameScript = await this.generateGameScript(teamA, teamB, playerA, playerB);

    return {
      teamA,
      teamB,
      playerA: playerAProp,
      playerB: playerBProp,
      gameScript
    };
  }

  /**
   * Generate a random player prop
   */
  private static generatePlayerProp(player: NFLPlayer): PlayerProp {
    const templates = PLAYER_PROP_TEMPLATES[player.position as keyof typeof PLAYER_PROP_TEMPLATES];
    if (!templates) {
      throw new Error(`No prop templates found for position: ${player.position}`);
    }

    const template = templates[Math.floor(Math.random() * templates.length)];
    const overUnder = Math.random() < 0.5 ? 'Over' : 'Under';

    return {
      player: player.name,
      position: player.position,
      team: player.team,
      prop: template.prop,
      line: template.line,
      type: template.type,
      overUnder
    };
  }

  /**
   * Generate AI game script using OpenAI
   */
  private static async generateGameScript(
    teamA: NFLTeam,
    teamB: NFLTeam,
    playerA: NFLPlayer,
    playerB: NFLPlayer
  ): Promise<GameScript> {
    const prompt = this.buildGameScriptPrompt(teamA, teamB, playerA, playerB);

    try {
      console.log('Calling OpenAI API with model: gpt-3.5-turbo');
      const response = await fetch(this.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Clean up the response content (remove any markdown formatting)
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Parse JSON response
      const gameScript = JSON.parse(cleanContent) as GameScript;
      return gameScript;
    } catch (error) {
      console.error('Error generating game script:', error);
      // Return a fallback script if API fails
      return this.generateFallbackScript(teamA, teamB, playerA, playerB);
    }
  }

  /**
   * Build the AI prompt for game script generation
   */
  private static buildGameScriptPrompt(
    teamA: NFLTeam,
    teamB: NFLTeam,
    playerA: NFLPlayer,
    playerB: NFLPlayer
  ): string {
    return `You are an AI Sports Simulation Engine. Your sole purpose is to generate detailed, realistic, play-by-play game scripts in a structured JSON format. You must adhere strictly to the requested format and all constraints.

Task: Generate a complete, but condensed, play-by-play JSON script for a fictional NFL game between ${teamA.name} and ${teamB.name}. Each play object must contain the updated score and game clock. The outcome of the game and all player performances must be completely random. The script should conclude with a final GAME_FINAL summary object.

Key Players to Feature:
Player A: ${playerA.name}, ${playerA.position} for the ${teamA.name}
Player B: ${playerB.name}, ${playerB.position} for the ${teamB.name}

IMPORTANT STATISTICAL REALISM:
- Quarterbacks should have realistic passing stats: 8-15 yards per completion, occasional 20-40 yard completions, rare 50+ yard completions
- Running backs should have realistic rushing stats: 2-8 yards per carry, occasional 10-20 yard runs, rare 30+ yard runs
- Wide receivers should have realistic receiving stats: 5-15 yards per catch, occasional 20-30 yard catches, rare 40+ yard catches
- Touchdowns should be realistic: QBs throw 1-4 TDs per game, RBs rush for 0-2 TDs per game, WRs catch 0-2 TDs per game
- Game should end at Quarter 4 - do not go beyond Q4

CRITICAL REQUIREMENTS FOR REALISTIC GAME:
1. MINIMUM STATS GUARANTEE: Each featured player MUST have at least:
   - 1 touchdown (passing, rushing, or receiving)
   - Realistic yardage totals (QBs: 200+ yards, RBs: 50+ yards, WRs/TEs: 40+ yards)

2. REALISTIC PLAY DISTRIBUTION:
   - QBs should have 20-35 passing attempts with 8-15 yards per completion
   - RBs should have 10-20 rushing attempts with 3-8 yards per carry
   - WRs/TEs should have 5-15 receptions with 5-15 yards per catch
   - Include occasional big plays (20+ yards) and rare explosive plays (40+ yards)

3. GAME FLOW REALISM:
   - Start with conservative play calling, build momentum
   - Include red zone opportunities and goal line situations
   - Mix of short passes, runs, and occasional deep shots
   - Realistic scoring patterns (not every drive ends in points)
   - Game should end at Quarter 4 - do not go beyond Q4

CRITICAL: Play descriptions must be VERY SPECIFIC for stat tracking:
- For QB passing: "PlayerName passes for X yards" or "PlayerName completes pass for X yards"
- For QB rushing: "PlayerName rushes for X yards" or "PlayerName runs for X yards"
- For RB rushing: "PlayerName rushes for X yards" or "PlayerName runs for X yards"
- For WR/TE receiving: "PlayerName catches pass for X yards" or "PlayerName receives pass for X yards"
- For touchdowns: "PlayerName passes for X yards touchdown" or "PlayerName rushes for X yards touchdown" or "PlayerName catches pass for X yards touchdown"
- ALWAYS include the player name and the exact yardage in every description

JSON Structures:

Play Object Structure:
{
  "timestamp_seconds": <integer>,
  "quarter": <integer>,
  "game_clock": "<string>",
  "down": <integer or null>,
  "distance": <integer or null>,
  "yard_line": <integer>,
  "possessing_team": "<string>",
  "description": "<string>",
  "involved_players": ["<string>"],
  "team_A_score": <integer>,
  "team_B_score": <integer>
}

Final Summary Object Structure (must be the last object in the array):
{
  "event_type": "GAME_FINAL",
  "final_score": {
    "${teamA.abbreviation}": <integer>,
    "${teamB.abbreviation}": <integer>
  },
  "winning_team": "<string>",
  "player_A_final_stats": "<string>",
  "player_B_final_stats": "<string>"
}

Constraints:
- Length: Generate a condensed game script of approximately 40-50 total plays, followed by the final summary object.
- Player Emphasis: While the game's outcome must be random, ensure that Player A and Player B are frequently involved in the action.
- Time Flow: The timestamp_seconds should be a simple integer incrementing by 1 for each play. The game_clock should decrease by a realistic, variable amount of game time with each play.
- Quarter Limit: The game MUST end at Quarter 4. Do not create plays beyond Q4.
- Simplicity: Avoid complex events like penalties, fumbles, or interceptions.
- Statistical Realism: Ensure all player stats are realistic for their positions (QB passing yards, RB rushing yards, etc.)
- MINIMUM STATS: Each featured player must have at least 1 touchdown and realistic yardage totals
- Output Format: Your entire output must be ONLY a valid JSON array. Do not include any markdown formatting, code blocks, or explanatory text. Start with [ and end with ]. Each play object must be properly formatted JSON.`;
  }

  /**
   * Generate a fallback script if OpenAI API fails
   */
  private static generateFallbackScript(
    teamA: NFLTeam,
    teamB: NFLTeam,
    playerA: NFLPlayer,
    playerB: NFLPlayer
  ): GameScript {
    const plays: GamePlay[] = [];
    let teamAScore = 0;
    let teamBScore = 0;
    let gameClock = "15:00";
    let quarter = 1;

    // Generate realistic plays (stop at Quarter 4) with guaranteed minimum stats
    let playerATouchdowns = 0;
    let playerBTouchdowns = 0;
    let playerAYards = 0;
    let playerBYards = 0;
    
    // Helper function to decrement game clock properly
    const decrementGameClock = (currentClock: string): string => {
      const [minutes, seconds] = currentClock.split(':').map(Number);
      let newMinutes = minutes;
      let newSeconds = seconds;
      
      // Decrement by 5-15 seconds per play (realistic)
      const decrementSeconds = Math.floor(Math.random() * 11) + 5; // 5-15 seconds
      newSeconds -= decrementSeconds;
      
      // Handle minute rollover
      if (newSeconds < 0) {
        newMinutes -= 1;
        newSeconds += 60;
      }
      
      // Handle quarter end
      if (newMinutes < 0) {
        return "0:00"; // End of quarter
      }
      
      return `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
    };
    
    for (let i = 0; i < 48; i++) {
      const timestamp = i + 1;
      
      // Update game clock and quarters (stop at Q4)
      if (i % 12 === 0 && i > 0 && quarter < 4) {
        quarter++;
        gameClock = "15:00";
      } else if (quarter >= 4 && gameClock === "0:00") {
        break; // Stop at end of Q4
      } else {
        gameClock = decrementGameClock(gameClock);
      }

      // Random scoring
      if (Math.random() < 0.08) { // 8% chance of scoring
        if (Math.random() < 0.5) {
          teamAScore += Math.random() < 0.7 ? 7 : 3; // 70% TD, 30% FG
        } else {
          teamBScore += Math.random() < 0.7 ? 7 : 3;
        }
      }

      // Generate realistic play descriptions based on position
      let description = '';
      let involvedPlayer = '';
      let yards = 0;
      let isTouchdown = false;
      
      // Ensure minimum stats - force touchdowns if needed
      const needsPlayerATD = playerATouchdowns === 0 && i > 20;
      const needsPlayerBTD = playerBTouchdowns === 0 && i > 20;
      
      if (Math.random() < 0.4 || needsPlayerATD) {
        // Player A involved
        involvedPlayer = playerA.name;
        if (playerA.position === 'QB') {
          yards = Math.random() < 0.7 ? Math.floor(Math.random() * 8) + 8 : Math.floor(Math.random() * 20) + 15; // 8-15 yards mostly, occasional 15-35
          description = `${playerA.name} passes for ${yards} yards`;
          playerAYards += yards;
        } else if (playerA.position === 'RB') {
          yards = Math.random() < 0.8 ? Math.floor(Math.random() * 7) + 2 : Math.floor(Math.random() * 15) + 10; // 2-8 yards mostly, occasional 10-25
          description = `${playerA.name} rushes for ${yards} yards`;
          playerAYards += yards;
        } else {
          yards = Math.random() < 0.7 ? Math.floor(Math.random() * 11) + 5 : Math.floor(Math.random() * 20) + 15; // 5-15 yards mostly, occasional 15-35
          description = `${playerA.name} catches pass for ${yards} yards`;
          playerAYards += yards;
        }
        
        // Force touchdown if needed
        if (needsPlayerATD && Math.random() < 0.3) {
          isTouchdown = true;
          playerATouchdowns++;
          description += ' touchdown';
        }
      } else if (Math.random() < 0.7 || needsPlayerBTD) {
        // Player B involved
        involvedPlayer = playerB.name;
        if (playerB.position === 'QB') {
          yards = Math.random() < 0.7 ? Math.floor(Math.random() * 8) + 8 : Math.floor(Math.random() * 20) + 15;
          description = `${playerB.name} passes for ${yards} yards`;
          playerBYards += yards;
        } else if (playerB.position === 'RB') {
          yards = Math.random() < 0.8 ? Math.floor(Math.random() * 7) + 2 : Math.floor(Math.random() * 15) + 10;
          description = `${playerB.name} rushes for ${yards} yards`;
          playerBYards += yards;
        } else {
          yards = Math.random() < 0.7 ? Math.floor(Math.random() * 11) + 5 : Math.floor(Math.random() * 20) + 15;
          description = `${playerB.name} catches pass for ${yards} yards`;
          playerBYards += yards;
        }
        
        // Force touchdown if needed
        if (needsPlayerBTD && Math.random() < 0.3) {
          isTouchdown = true;
          playerBTouchdowns++;
          description += ' touchdown';
        }
      } else {
        // Other players
        yards = Math.floor(Math.random() * 8) + 2;
        description = `Unknown Player rushes for ${yards} yards`;
      }

      const play: GamePlay = {
        timestamp_seconds: timestamp,
        quarter,
        game_clock: gameClock,
        down: Math.random() < 0.8 ? Math.floor(Math.random() * 4) + 1 : null,
        distance: Math.random() < 0.8 ? Math.floor(Math.random() * 20) + 1 : null,
        yard_line: Math.floor(Math.random() * 100),
        possessing_team: Math.random() < 0.5 ? teamA.name : teamB.name,
        description,
        involved_players: involvedPlayer ? [involvedPlayer] : [],
        team_A_score: teamAScore,
        team_B_score: teamBScore
      };

      plays.push(play);
    }

    const final: GameFinal = {
      event_type: "GAME_FINAL",
      final_score: {
        [teamA.abbreviation]: teamAScore,
        [teamB.abbreviation]: teamBScore
      },
      winning_team: teamAScore > teamBScore ? teamA.name : teamB.name,
      player_A_final_stats: `${playerA.name}: ${Math.floor(Math.random() * 200) + 50} yards, ${Math.floor(Math.random() * 3)} TDs`,
      player_B_final_stats: `${playerB.name}: ${Math.floor(Math.random() * 200) + 50} yards, ${Math.floor(Math.random() * 3)} TDs`
    };

    return [...plays, final];
  }

  /**
   * Determine if a player prop hit based on final stats
   */
  /**
   * Parse player stats from play descriptions
   */
  private static parseStatsFromPlays(gameScript: GameScript, playerA: string, playerB: string): { playerAStats: PlayerStats, playerBStats: PlayerStats } {
    const playerAStats: PlayerStats = {
      passing_yards: 0,
      passing_tds: 0,
      rushing_yards: 0,
      rushing_tds: 0,
      receiving_yards: 0,
      receiving_tds: 0,
      receptions: 0
    };

    const playerBStats: PlayerStats = {
      passing_yards: 0,
      passing_tds: 0,
      rushing_yards: 0,
      rushing_tds: 0,
      receiving_yards: 0,
      receiving_tds: 0,
      receptions: 0
    };

    // Parse each play for stats
    gameScript.forEach((play) => {
      if (play.event_type === 'GAME_FINAL') return;
      
      const playObj = play as GamePlay;
      const description = playObj.description.toLowerCase();
      
      // Check if player A is involved
      if (playObj.involved_players?.includes(playerA)) {
        this.parsePlayStats(description, playerAStats);
      }
      
      // Check if player B is involved
      if (playObj.involved_players?.includes(playerB)) {
        this.parsePlayStats(description, playerBStats);
      }
    });

    return { playerAStats, playerBStats };
  }

  /**
   * Parse individual play stats from description
   */
  static parsePlayStats(description: string, stats: PlayerStats): PlayerStats {
    const newStats = { ...stats };
    const lowerDesc = description.toLowerCase();
    
    // Extract yards from descriptions like "passes for 12 yards", "rushes for 8 yards"
    const yardsMatch = lowerDesc.match(/(\d+)\s+yards?/);
    const yards = yardsMatch ? parseInt(yardsMatch[1]) : 0;

    // Extract touchdowns
    const tdMatch = lowerDesc.match(/touchdown|td|scores/);
    const isTD = !!tdMatch;

    // Debug logging
    console.log(`Parsing play: "${description}"`);
    console.log(`Extracted yards: ${yards}, isTD: ${isTD}`);

    // Determine play type - ORDER MATTERS! Check receiving first since "catches pass" contains "pass"
    if (lowerDesc.includes('catch') || lowerDesc.includes('reception') || lowerDesc.includes('receives')) {
      newStats.receiving_yards += yards;
      newStats.receptions += 1;
      if (isTD) newStats.receiving_tds += 1;
      console.log(`Updated receiving stats: ${newStats.receiving_yards} yards, ${newStats.receiving_tds} TDs, ${newStats.receptions} receptions`);
    } else if (lowerDesc.includes('pass') || lowerDesc.includes('completion')) {
      newStats.passing_yards += yards;
      if (isTD) newStats.passing_tds += 1;
      console.log(`Updated passing stats: ${newStats.passing_yards} yards, ${newStats.passing_tds} TDs`);
    } else if (lowerDesc.includes('rush') || lowerDesc.includes('run')) {
      newStats.rushing_yards += yards;
      if (isTD) newStats.rushing_tds += 1;
      console.log(`Updated rushing stats: ${newStats.rushing_yards} yards, ${newStats.rushing_tds} TDs`);
    } else {
      console.log(`No matching play type found for: "${description}"`);
    }
    
    return newStats;
  }

  static determinePropOutcome(prop: PlayerProp, finalStats: PlayerStats): 'hit' | 'miss' {
    const actualValue = finalStats[prop.type as keyof PlayerStats] || 0;
    const line = prop.line;
    
    if (prop.overUnder === 'Over') {
      return actualValue > line ? 'hit' : 'miss';
    } else {
      return actualValue < line ? 'hit' : 'miss';
    }
  }
}
