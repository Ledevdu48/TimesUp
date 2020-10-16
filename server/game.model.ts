function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

export class Game {
    constructor(
        public players: string[],
        public team: any[],
        public stageGame: string,
        public score: number[],
        public listOfWords: string[],
        public parameters: any,
        public remainingWords: string[]
    ) {}

    randomizeTeam() {
        let remainingPlayers = this.players;
        let n = remainingPlayers.length;
        let chosenTeam = 0
        while (n != 0) {
            let chosenPlayer = getRandomInt(0,n);
            this.team[chosenTeam].push(remainingPlayers[chosenPlayer])
            remainingPlayers.splice(chosenPlayer,1);
            n = remainingPlayers.length
            if (chosenTeam == 0) {
                chosenTeam = 1
            } else {
                chosenTeam = 0
            }
        }        
    }

    chooseTeam() {
        return getRandomInt(0,2)
    }

    nextTeam(lastTeam) {
        if (lastTeam == 0) {
            return 1
        }
        else {
            return 0
        }
    }

    nextWord(idLastWord: number) {
        const n = this.remainingWords.length
        if (n == 1){
            return [0, this.remainingWords[0]]
        } 
        else {
            let idWord = getRandomInt(0,n);
            while (idWord == idLastWord) {
                idWord = getRandomInt(0,n);
            }
            const word = this.remainingWords[idWord];
            return [idWord, word]
        }
    }

    rotateTeam(chosenTeam: number) {
        const player = this.team[chosenTeam][0];
        this.team[chosenTeam].splice(0,1);
        this.team[chosenTeam].push(player);        
    }
    
    initStage(nameStage: string) {
        this.stageGame = nameStage;
        if (this.stageGame === 'step 1' || this.stageGame === 'step 2' || this.stageGame === 'step 3') {
            this.remainingWords = this.listOfWords;
            const chosenTeam = this.chooseTeam();
            const chosenPlayer = this.team[chosenTeam][0];
            this.rotateTeam(chosenTeam);
            return [chosenTeam, chosenPlayer]
        }
    }

    initNextPlayer(lastTeam: number, foundWords: any[]) {
        this.score[lastTeam] += foundWords.length;
        for (let word in foundWords) {
            const id = word[0];
            this.remainingWords.splice(id, 1);
        }
        this.rotateTeam(lastTeam);
        const chosenTeam = this.nextTeam(lastTeam);
        const chosenPlayer = this.team[chosenTeam][0];
        return [chosenTeam, chosenPlayer]      
    }
}


const game1 = new Game(
    ['Toto', 'Tata', 'Titi', 'Wil'], 
    [[],[]],
    'step1',
    [25, 21],
    ['un ours en armure', 'Castet qui fait Salut les filles', 'Baptiste qui fait de la trompette', 'Rudy qui dort', 'Romain qui rage à fifa'],
    {numberOfwords: 7, timer1: 20, timer2: 20, timer3: 30},
    []
)

game1.randomizeTeam();
console.log(game1.team)

const [firstTeam, firstPlayer] = game1.initStage('step 1');
console.log([firstTeam, firstPlayer]);
console.log(game1.team)

const words = [[1, 'un ours en armure']];

const [secondTeam, secondPlayer] = game1.initNextPlayer(firstTeam, words);
console.log(game1.score)
console.log(game1.remainingWords)
console.log(game1.team)
console.log([secondTeam, secondPlayer])