var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = module.exports = express();
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '../client/dist/projet-timesup')));
app.get('*', (req, res) => {
    return res.sendFile(path.join(__dirname, '../client/dist/projet-timesup/index.html'))
})
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server)
server.listen(3000);

var rooms = [];

var admin = ['Ledevdu48', '8060marseille'];

io.on('connection', socket => {

    socket.on('joinAdmin', data => {
        if (data.pseudo === admin[0] && data.password === admin [1]) {
            socket.join('$admin');
            io.in('$admin').emit('goToAdminPanel')
        }
    })

    socket.on('askRooms', () => {
        io.in('$admin').emit('rooms', rooms)
    })

    socket.on('joinRoom', data => {
        if (getRoomByCode(data.name) === undefined) {
            const game1 = new Game(
                [],
                [[], []],
                ['', ''],
                'creation',
                [0, 0],
                [],
                { numberProp: 0, timer: {} },
                []
            )
            const roomObject = {
                id: 1,
                code: '',
                game: game1
            };
            roomObject.code = data.name;
            if (rooms.length != 0) {
                roomObject.id = rooms[(rooms.length - 1)].id + 1;
            }
            roomObject.game.players.push([socket.id, data.pseudo]);
            rooms.push(roomObject);
            socket.join(roomObject.code)
            socket.emit('joinGame')
            io.emit('yourRoom', roomObject.code)
            io.in(roomObject.code).emit('yourPlayers', roomObject.game.players);
        } else {
            const roomObject = getRoomByCode(data.name);
            if (roomObject.game.stageGame === 'creation') {
                if (roomObject.game.pseudoAlreadyTaken(data.pseudo) === false) {
                    roomObject.game.players.push([socket.id, data.pseudo]);
                    socket.join(roomObject.code)
                    socket.emit('joinGame')
                    io.emit('yourRoom', roomObject.code)
                    io.in(roomObject.code).emit('yourPlayers', roomObject.game.players)
                } else {
                    socket.emit('pseudoAlreadyTaken')
                }
            } else {
                socket.emit('gameAlreadyCreated')
            }
        }
    })

    socket.on('getRoomCode', () => {
        const sockrooms = socket.rooms;
        for (let key in sockrooms) {
            if (key != socket.id) {
                const room = sockrooms[key];
                const roomObject = getRoomByCode(room);
                io.in(roomObject.code).emit('sendInfos', room, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
            }
        }
    })

    socket.on('randomizeTeam', roomCode => {
        const roomObject = getRoomByCode(roomCode);
        roomObject.game.team = [[], []];
        roomObject.game.randomizeTeam();
        io.in(roomObject.code).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
    })

    socket.on('parametersToUsers', (data, roomCode) => {
        socket.in(roomCode).emit('newParameters', data)
    })

    socket.on('parametersToGame', (data, roomCode) => {
        const roomObject = getRoomByCode(roomCode);
        roomObject.game.stageGame = 'proposal';
        roomObject.game.parameters.numberProp = data.numberProp;
        roomObject.game.parameters.timer['Step 1'] = data.timerStep1;
        roomObject.game.parameters.timer['Step 2'] = data.timerStep2;
        roomObject.game.parameters.timer['Step 3'] = data.timerStep3;
        roomObject.game.nameTeam[0] = data.nameTeam1;
        roomObject.game.nameTeam[1] = data.nameTeam2;
        io.in(roomCode).emit('yourRoom', roomCode)
        io.in(roomCode).emit('goToProposal')
    })

    socket.on('chargingProposal', roomCode => {
        const roomObject = getRoomByCode(roomCode);
        io.in(roomCode).emit('yourRoom', roomCode);
        io.in(roomCode).emit('numberProp', roomObject.game.parameters.numberProp)
    })

    socket.on('yourProposals', (proposals, roomCode) => {
        const roomObject = getRoomByCode(roomCode);
        for (let proposal of proposals) {
            roomObject.game.listOfWords.push(proposal[1]);
        }
        if (roomObject.game.listOfWords.length == roomObject.game.parameters.numberProp * roomObject.game.players.length) {
            io.in(roomCode).emit('goToListen')
            const [chosenTeam, chosenPlayer, timer] = roomObject.game.initStage('Step 1');
            io.in(roomCode).emit('nextPlayer', chosenTeam, chosenPlayer, timer)
            io.in(roomObject.code).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
            io.in(chosenPlayer[0]).emit('goToPlay')
        } else {
            io.in(socket.id).emit('waitingOthers')
        }
    })
    
    socket.on('chargingListener', roomCode => {
        const roomObject = getRoomByCode(roomCode);
        io.in(roomCode).emit('yourRoom', roomCode);
    })

    socket.on('chargingPlayer', roomCode => {
        const roomObject = getRoomByCode(roomCode);
        io.in(roomCode).emit('yourRoom', roomCode);
    })

    socket.on('launchTimer', (roomCode, timer) => {
        let timeLeft = timer;
        let interval = setInterval(() => {
            if(timeLeft>0) {
              timeLeft--;
              io.in(roomCode).emit('sendTimer', timeLeft)
            } else {
              clearInterval(interval)
            }
          }, 1000)
        socket.on ('end', () => {
            clearInterval(interval)
        })
    })

    socket.on('start', roomCode => {
        const roomObject = getRoomByCode(roomCode);
        if (roomObject.game.stageGame === "Step 3") {
            io.in(roomCode).emit('initCanvas')
        }
        io.in(roomCode).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, true, false)
    })

    socket.on('end', roomCode => {
        const roomObject = getRoomByCode(roomCode);
        io.in(roomCode).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, true)
    })

    socket.on('askProposal', (roomCode, currentProposal, firstBool) => {
        const roomObject = getRoomByCode(roomCode);
        const game = roomObject.game;
        const proposal = game.nextWord(currentProposal[0]);
        if (!firstBool) {
            io.in(roomCode).emit('skipProposal')
        }        
        io.in(socket.id).emit('sendProposal', proposal)
    })

    socket.on('validateProposal', (roomCode, currentProposal) => {
        const roomObject = getRoomByCode(roomCode);
        const game = roomObject.game;
        game.actualiseRemainingWords(currentProposal[0])
        const proposal = game.nextWord(currentProposal[0]);
        io.in(roomCode).emit('goodProposal')
        io.in(socket.id).emit('sendProposal', proposal)
    })

    socket.on('draw', (data, roomCode) => {
        io.in(roomCode).emit('drawEmit', data)
    })

    socket.on('startPosition', (data, roomCode) => {
        io.in(roomCode).emit('startPositionEmit', data)
    })

    socket.on('endPosition', (data, roomCode) => {
        io.in(roomCode).emit('endPositionEmit', data)
    })

    socket.on('fill', (color, roomCode) => {
        io.in(roomCode).emit('fillEmit', color);
    })

    socket.on('resultsRound', (roomCode, lastTeam, unvalidWords, validWords, timer) => {
        const roomObject = getRoomByCode(roomCode);
        const game = roomObject.game;
        const [chosenTeam, chosenPlayer] = game.initNextPlayer(lastTeam, validWords, unvalidWords);
        if (game.remainingWords.length ===0){
            if (game.stageGame === 'Step 1') {
                game.stageGame = 'Result 1';
                io.in(roomObject.code).emit('goToResult')
                io.in(roomObject.code).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
                setTimeout(() => {
                    io.in(roomCode).emit('goToListen')
                    const [chosenTeam, chosenPlayer, timer] = game.initStage('Step 2');
                    io.in(roomCode).emit('nextPlayer', chosenTeam, chosenPlayer, timer, validWords);
                    io.in(chosenPlayer[0]).emit('goToPlay');
                }, 1000*8)
            }
            else if (game.stageGame === 'Step 2') {
                game.stageGame = 'Result 2';
                io.in(roomObject.code).emit('goToResult')
                io.in(roomObject.code).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
                setTimeout(() => {
                    io.in(roomCode).emit('goToListen')
                    const [chosenTeam, chosenPlayer, timer] = game.initStage('Step 3');
                    io.in(roomCode).emit('nextPlayer', chosenTeam, chosenPlayer, timer, validWords);
                    io.in(chosenPlayer[0]).emit('goToPlay');
                }, 1000*8)
            } 
            else {
                io.in(roomCode).emit('endGame')
            }
        } else {
            io.in(roomCode).emit('nextPlayer', chosenTeam, chosenPlayer, timer, validWords);
            io.in(chosenPlayer[0]).emit('goToPlay');
        }        
        io.in(roomObject.code).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
    })

    socket.on('restart', (roomCode) => {
        const roomObject = getRoomByCode(roomCode);
        const players = roomObject.game.players
        roomObject.game = new Game(
            players,
            [[], []],
            ['', ''],
            'creation',
            [0, 0],
            [],
            { numberProp: 0, timer: {} },
            []
        )
        io.in(roomObject.code).emit('goToCreation')
        io.in(roomObject.code).emit('sendInfos', roomCode, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
    })

    socket.on('disconnecting', () => {
        const sockrooms = socket.rooms;
        for (let key in sockrooms) {
            if (key != socket.id && key!= '$admin') {
                const room = sockrooms[key];
                const id = playerId(socket.id, room);
                const roomObject = getRoomByCode(room);
                roomObject.game.players.splice(id, 1);
                if (roomObject.game.players.length == 0) {
                    const idRoom = getIdRoomByCode(room);
                    rooms.splice(idRoom, 1)
                } else {
                    io.in(roomObject.code).emit('sendInfos', room, roomObject.game.players, roomObject.game.team, roomObject.game.nameTeam, roomObject.game.score, roomObject.game.stageGame, false, false)
                }
            }
        }
    })
})

class Game {
    constructor(
        players,
        team,
        nameTeam,
        stageGame,
        score,
        listOfWords,
        parameters,
        remainingWords
    ) {
        this.players = players;
        this.team = team;
        this.nameTeam = nameTeam;
        this.stageGame = stageGame;
        this.score = score;
        this.listOfWords = listOfWords;
        this.parameters = parameters;
        this.remainingWords = remainingWords
    }

    randomizeTeam() {
        let remainingPlayers = this.players;
        let n = remainingPlayers.length;
        let chosenTeam = 0
        while (n != 0) {
            let chosenPlayer = getRandomInt(0, n);
            this.team[chosenTeam].push(remainingPlayers[chosenPlayer])
            remainingPlayers = suppr(remainingPlayers, chosenPlayer)
            n = remainingPlayers.length
            if (chosenTeam == 0) {
                chosenTeam = 1
            } else {
                chosenTeam = 0
            }
        }
    }

    chooseTeam() {
        return getRandomInt(0, 2)
    }

    nextTeam(lastTeam) {
        if (lastTeam == 0) {
            return 1
        }
        else {
            return 0
        }
    }

    nextWord(idLastWord) {
        const n = this.remainingWords.length
        if (n == 0){
            return[-1, ''];
        }
        if (n == 1) {
            return [0, this.remainingWords[0]]
        }
        else {
            let idWord = getRandomInt(0, n);
            while (idWord == idLastWord) {
                idWord = getRandomInt(0, n);
            }
            const word = this.remainingWords[idWord];
            return [idWord, word]
        }
    }

    rotateTeam(chosenTeam) {
        const player = this.team[chosenTeam][0];
        this.team[chosenTeam].splice(0, 1);
        this.team[chosenTeam].push(player);
    }

    initStage(nameStage) {
        this.stageGame = nameStage;
        if (this.stageGame === 'Step 1' || this.stageGame === 'Step 2' || this.stageGame === 'Step 3') {
            for (let word of this.listOfWords) {
                this.remainingWords.push(word);
            }
            const chosenTeam = this.chooseTeam();
            const chosenPlayer = this.team[chosenTeam][0];
            const timer = this.parameters.timer[this.stageGame];
            this.rotateTeam(chosenTeam);
            return [chosenTeam, chosenPlayer, timer]
        }
    }

    actualiseRemainingWords(idFoundWord) {
        this.remainingWords.splice(idFoundWord,1);
    }

    initNextPlayer(lastTeam, foundWords, unvalidWords) {
        this.score[lastTeam] += foundWords.length;
        for (let word of unvalidWords) {
            this.remainingWords.push(word)
        }
        this.rotateTeam(lastTeam);
        const chosenTeam = this.nextTeam(lastTeam);
        const chosenPlayer = this.team[chosenTeam][0];
        return [chosenTeam, chosenPlayer]
    }

    pseudoAlreadyTaken(pseudo) {
        for (let player of this.players) {
            if (player[1] === pseudo) {
                return true
            }
        }
        return false
    }
}

function getIdRoomByCode(code) {
    const id = rooms.findIndex(
        (s) => {
            return s.code === code;
        }
    )
    return id;
}

function getRoomByCode(code) {
    const room = rooms.find(
        (s) => {
            return s.code === code;
        }
    )
    return room;
}

function playerId(sockId, roomName) {
    const room = getRoomByCode(roomName);
    for (playId in room.players) {
        if (room.players[playId][0] === sockId) {
            return playId
        }
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function suppr(l, i) {
    const list = [];
    for (indice in l) {
        if (indice != i) {
            list.push(l[indice]);
        }
    }
    return list
}