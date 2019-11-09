/**
 * Created by ggoma on 2016. 11. 23..
 */
import React, {Component} from 'react';
import {
SafeAreaView,
WebView,
View,
StyleSheet,
Image,
Text,
Modal,
TouchableOpacity,
Alert,
Button,
TouchableWithoutFeedback,
Dimensions
} from 'react-native';

import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

import CreateBlock from './create_block';


import Cell from './cell';
import Preview from './preview';
import {belongs, createRandomBag, createRandomBlock, createInit, generateSolution, createBlock, getRandomInt} from './helpers';
import {rotate, srs} from './rotation';
import {solve} from './solver';

export default class Grid extends Component {



    constructor(props) {
        super(props);
        this.state = {
            w: props.w,
            h: props.h,
            gravity: props.gravity,
            init: props.init,
            grid: [],
            blocks: [],
            holdPiece: [{id:-1, type:'', color: ''}],
            numPreviews: 5,
            score: 0,
            started: false,
            gameOver: true,
            paused: false,
            help: false,
            settingOpen: false,
            numBlocks: 5,
            url: "https://google.com",
            numRounds: 0
        }

        this.lastBlocks = [];
        this.streak = 0;
        this.won = false;
        this.navigate = props.navigate;
        this.grid = [];
        this.id = 1;
        this.currentBlock = 'J';
        this.rotation = 0;
        this.gravity = 1000;
        this.changeColor = this.changeColor.bind(this);
        this.checkColor = this.checkColor.bind(this);
        this.held = false;
        this.movedPiece = false; // whether user moved piece on last tick to delay lock
        this.tickCount = 0;
        this.gravityOn = props.gravity;
        this.hardDropActive = false;
        this.sonicDropActive = false;
        this.sonicDropSetting = true;
        this.activePiece = [];
        this.EMPTY = '#24305e';
        this.solution = [];
        this.solutionMode = false;

        this.typeColorDict = {'I':'skyblue', 'O':'yellow', 'T':'purple', 'S':'green', 'Z':'red', 'J':'blue', 'L':'orange'};



    }

    componentDidMount() {
        this.setState({blocks: this.generateBlocks()}, () => this.createGrid());
        if (this.solution == null) {
            console.log("failed to solve");
            this.solutionMode = false;
        }
    }

    createGrid() {
        const {w, h} = this.state;
        var grid = [];
        var row = [];

        for(i = 1; i <= h; i++) { //h is 20, so i want 20 rows
            for(j = 1; j <= w; j++) { // w is 10
                var cell = 0;
                row.push(cell);
            }
            grid.push(row);
            row = [];
        }
        this.grid = grid;
        this.setState({grid}, () => {
          this.startGame();
        });
    }

    initPerfectClear() {
      x = createInit(this.state.init);
      for (i = 0; i < x.length; i++){
        this.changeColor(x[i][0], x[i][1], 'gray');
      }
      if (this.solutionMode)
        this.solution = solve(x, this.state.holdPiece[0].type, this.state.blocks.map(block => block.type), this.state.h, this.state.w);
    }

    resetInterval(delay) {
        clearInterval(this.interval);
        if (arguments.length == 0) {
            if (this.gravityOn)
                delay = this.gravity;
            else
                return;
        }
        this.interval = setInterval(() => {
            this.tick()
        }, delay)
    }

    startGame() {
        this.setState({gameOver: false, started: true, score: 0, numRounds: 0, url: this.url},
          () => this.loadNextBlock());
        this.initPerfectClear();
    }

    tryAgain() {
        this.setState({gameOver: false, score: 0, numPreviews: 5, blocks: this.generateBlocks()}, () => {
            this.held = false;
            this.refresh();
            this.startGame()
        });
    }

    refresh() {
        for(i = 4; i < 24; i++) {
            for(j = 0; j < 10; j++) {
                this.changeColor(i, j, this.EMPTY);
            }
        }
        //this.state.holdPiece = null;
    }

    checkColor(i,j) {
        var id = `${i},${j}`;
        if(this.refs[id] == null) {
            return null
        }
        // console.log(this.refs[id].state.color);
        return this.refs[id].state.color;
    }

    changeColor(i, j, color) {
        // console.log('changing color: ', i, j );

        var id = i + ',' + j;
        var bin = color == this.EMPTY ? 0 : 1;
        this.grid[i][j] = bin;
        this.refs[id].changeColor(color);
    }

    hardDrop() {
        if (this.sonicDropActive)
            return;
        this.hardDropActive = true;
        this.resetInterval(0);
    }

    softDrop() {
        this.tick();
    }

    sonicDrop() {
        if (this.hardDropActive)
            return;
        this.sonicDropActive = true;
        this.resetInterval(0);
    }

    // dir: left = -1, right = 1
    rotate(dir) {

        if (this.hardDropActive || this.sonicDropActive)
            return;

        if(this.grid[3].includes(1)) {
            //return
        }

        var color;
        var points = [];
        var previous = [];
        for (point of this.activePiece) {
            var i = point[0];
            var j = point[1];
            color = this.checkColor(i,j);
            this.changeColor(i,j, this.EMPTY);
            points.push([i, j]);
            previous.push([i,j]);
        }

        var rotated = rotate(this.currentBlock, points, this.rotation, dir);
        for (test = 0; test < 5; test++) {
            shift = srs(this.currentBlock, this.rotation, dir, test);
            srotated = rotated.map(p => [p[0]+shift[0], p[1]+shift[1]]);
            if(this.canRotate(srotated)) {
                this.movedPiece = true;
                this.rotation = (this.rotation + dir + 4) % 4;
                // console.log('valid rotation');
                srotated.map((point) => {
                    this.changeColor(point[0], point[1], color);
                });
                this.activePiece = srotated;
                return;
            }
        }
        // console.log('invalid rotation');
        previous.map((point) => {
            this.changeColor(point[0], point[1], color);
        });

    }

    canRotate(p) {
        var points = p;
        var canRotate = true;
        // console.log(points);
        points.map((point) => {
            if(point[0] == null || point[1] == null) {
                canRotate = false;
            } else {
                if(this.checkColor(point[0], point[1]) == null) {
                    canRotate = false;
                }
                if(this.checkColor(point[0], point[1]) == 'gray') {
                    canRotate = false;
                }
            }

        });
        return canRotate;
    }


    canShift(points, direction) {
        var can = true;
        var shift = direction == 'left' ? -1 : 1;
        points.map((point) => {
            if(this.checkColor(point.i, point.j+shift) == null){
                can = false;
            }

            if(this.checkColor(point.i, point.j+shift) == 'gray'){
                can = false;
            }
        });
        return can;
    }

    shift(points, direction) {

        if (this.hardDropActive || this.sonicDropActive)
            return;
        this.movedPiece = true;
        var shift = direction == 'left' ? -1 : 1;
        if (direction == 'right') {
            points = points.reverse();
        }
        points.map((point) => {
            this.changeColor(point.i, point.j + shift, this.checkColor(point.i, point.j));
            this.changeColor(point.i, point.j, this.EMPTY);
        })
        this.activePiece = this.activePiece.map((point) => [point[0], point[1] + shift]);
    }


    shiftCells(direction) {

        var points = [];

        for (point of this.activePiece)
            points.push({i:point[0], j:point[1]});


        var can = this.canShift(points, direction);
        if(can) {
            this.shift(points, direction);
        }


    }


    loadNextBlockHelper(type){

        this.hardDropActive = false;

        if (this.gravityOn)
            this.resetInterval();
        else
            this.resetInterval(0);

        this.currentBlock = type;
        var blockColor = this.typeColorDict[type];
        this.rotation = 0;
        if(type == 'I') 
            this.activePiece = [[2,3],[2,4],[2,5],[2,6]];
        else if(type == 'O') 
            this.activePiece = [[2,4],[2,5],[3,4],[3,5]];
        else if(type == 'T') 
            this.activePiece = [[2,4],[3,3],[3,4],[3,5]];
        else if(type == 'S') 
            this.activePiece = [[2,4],[2,5],[3,3],[3,4]];
        else if(type == 'Z') 
            this.activePiece = [[2,3],[2,4],[3,4],[3,5]];
        else if(type == 'J') 
            this.activePiece = [[2,3],[3,3],[3,4],[3,5]];
        else if(type == 'L') 
            this.activePiece = [[2,5],[3,3],[3,4],[3,5]];
        for (point of this.activePiece)
            this.changeColor(point[0], point[1], blockColor);
        var {blocks} = this.state;
        this.setState({blocks});
    }

    loadNextBlock() {

        var {blocks} = this.state;
        var next = blocks.splice(0,1)[0];

        this.held = false;

        this.loadNextBlockHelper(next.type);


    }

    generateBlocks() {
        if (this.lastBlocks.length > 0 && !this.won){
            if (this.state.init > 1 && this.state.init < 4) {
              this.setState({holdPiece: [{id:this.id++, type: 'I', color: this.typeColorDict['I']}]});
            } else if (this.state.init == 4){
              this.setState({holdPiece: [{id:this.id++, type: 'T', color: this.typeColorDict['T']}]});
            } else {
              this.setState({holdPiece: [{id:-1, type:'', color: ''}]});
            }
            return Array.from(this.lastBlocks);
        }
        var blocks = [];
        var solution_url = generateSolution(this.state.init);
        var solution = solution_url[0];
        var url = solution_url[1];
        this.url = url;
        var start = 0;
        if (this.state.init > 1){
           start += 1;
        }
        // console.log(solution);
        for(i = start; i < solution.length; i++) {
           blocks.push({id: this.id + i, ...createBlock(solution.charAt(i))});
        }
        var c = i;
        while (blocks.length < 5) {
          blocks.push({id: this.id + c, ...createRandomBlock()});
        }
        this.id += 5;
        if (this.state.init > 1){
          this.setState({holdPiece: [{id:this.id++, type:solution.charAt(0), color: this.typeColorDict[solution.charAt(0)]}]})
        } else {
          this.setState({holdPiece: [{id:-1, type:'', color: ''}]})
        }
        this.lastBlocks = Array.from(blocks);
        return blocks;
    }

    toString() {
        for (i = 0; i < 24; i++ ) {
            console.log(this.grid[i])
        }


    }

    checkRowsToClear() {
        var grid = this.grid;
        clearInterval(this.interval);
        var row_was_cleared = false;
        var rows_to_not_clear = [];
        var rows_in_piece = new Set();
        for (point of this.activePiece)
            rows_in_piece.add(point[0]);
        for (var i = 4; i <= 23; i++)
            if(!rows_in_piece.has(i) || grid[i].includes(0))
                rows_to_not_clear.push(i);
            else
                row_was_cleared = true;
        if (!row_was_cleared)
            return;
        var newrow, oldrow;
        for (newrow = oldrow = 23; newrow >= 4 && grid[newrow].includes(1); newrow--, oldrow--) {
            while (oldrow >= 4 && rows_in_piece.has(oldrow) && !grid[oldrow].includes(0))
                oldrow--;
            if (oldrow == newrow)
                continue;
            for (var j = 0; j < 10; j++)
                this.changeColor(newrow, j, oldrow >= 4 && grid[oldrow][j] ? 'gray' : this.EMPTY);
        }

        this.setState({score: this.state.score + 1000 * (newrow-oldrow)});
    }

    clearCurrentPiece(){
        var points = [];
        const {grid, w, h} = this.state;
        for (point of this.activePiece)
            points.push({i:point[0], j:point[1]});
        points.reverse();
        points.map(point => {
            if(this.checkColor(point.i, point.j) != this.EMPTY && this.checkColor(point.i, point.j) != 'gray') {
                //active piece
                this.changeColor(point.i, point.j, this.EMPTY);
            }

        });

    }

    canMoveDown(points) {
        var canmove = true;
        points.map(point => {
            if(this.checkColor(point.i + 1, point.j) == null) {
                canmove = false;
            }

            if(this.checkColor(point.i + 1, point.j) == 'gray') {
                canmove = false;
            }

        });
        return canmove;
    }

    moveDown(points) {
        points.map(point => {
            this.changeColor(point.i+1, point.j, this.checkColor(point.i, point.j));
            this.changeColor(point.i, point.j, this.EMPTY);
        })
        this.activePiece = this.activePiece.map(point => [point[0]+1, point[1]]);
    }

    makeMove() {
        if (
            this.solutionMode && !this.hardDropActive
            && !this.sonicDropActive && this.solution.length > 0
        ) {
            var move = this.solution.splice(0, 1)[0];
            switch (move) {
              case 'l': this.shiftCells('left'); break;
              case 'r': this.shiftCells('right'); break;
              case 'z': this.rotate(-1); break;
              case 'x': this.rotate(1); break;
              case 'h': this.HoldPiece(); break;
              case 'u': this.hardDrop(); break;
              case 'd': this.sonicDrop(); break;
              default: console.log("unimplemented move " + move);
            }
        }
    }

    tick() {
        if(!this.state.paused){
            this.makeMove();
            var points = [];
            const {grid, w, h} = this.state;
        if (this.tickCount > 0) {
            this.tickCount--;
            if (this.tickCount == 0) {
                this.resetInterval();
            }
        }
        var highest = 24;
        for (point of this.activePiece) {
            points.push({i:point[0], j:point[1]});
            highest = Math.min(highest, point[0]);
        }
        points.reverse();

        var can = this.canMoveDown(points);
        if(can){
            this.moveDown(points);
            if (!this.gravityOn && highest == 4 && !this.hardDropActive && !this.sonicDropActive)
                clearInterval(this.interval);
        };

            if(!can && this.grid[3].includes(1)) {
                clearInterval(this.interval);
                for (point of points)
                    this.changeColor(point.i, point.j, 'gray');
                this.setState({gameOver: true});
                // console.log('game over');
                return
            }
        if (this.movedPiece) {
          this.movedPiece = false;
          return;
        }
        if(!can) {
            if (this.sonicDropActive) {
                this.sonicDropActive = false;
                this.resetInterval();
                return;
            }
                for (point of points)
                    this.changeColor(point.i, point.j, 'gray');
                //cant move down

                this.can = true;
                this.checkRowsToClear();
                this.setState({numRounds: this.state.numRounds + 1}, () => {
                  if (this.state.numRounds >= 3 && this.state.init < 2) {
                    this.setState({gameOver:true, won: this.score >= 4000});
                  } else if (this.state.numRounds >= 4 && this.state.init >= 2){
                    this.setState({gameOver:true, won: this.score >= 4000});
                  } else {
                    this.loadNextBlock();
                    this.tickCount = 0;
                  }
                });
          }

    }
  }

    renderCells() {
        var size = 24;
        // console.log('rendering grid');
        return this.state.grid.map((row, i) => {
            if(i < 4) {
                return (
                    <View key={i} style={{height: 0, flexDirection: 'row'}}>
                        {row.map((cell, j) => {
                            var color = this.EMPTY;
                            return <Cell key={i+','+j} ref={i + ',' + j} color={color} size={size}/>
                        })}
                    </View>
                )
            }

            return (
                <View key={i} style={{flexDirection: 'row'}}>
                    {row.map((cell, j) => {
                        // console.log('color is:', cell)
                        var color = this.EMPTY;
                        if(cell == 1) {
                            color = 'blue';
                        } else if(cell == 2) {
                            color = 'green';
                        }

                        if(i < 4) {
                            color = 'red';
                        }

                        return <Cell key={i+','+j} ref={i + ',' + j} borderWidth={1} color={color} size={size}/>
                    })}
                </View>
            )
        })
    }


    renderButtons() {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <TouchableOpacity onPress={() => {if (!this.solutionMode) this.shiftCells('left')}}>
                    <Image style={styles.img} source={require('../img/left-filled.png')}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {if (!this.solutionMode) this.shiftCells('right')}}>
                    <Image style={styles.img} source={require('../img/right-filled.png')}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {if (!this.solutionMode) this.softDrop()}}>
                    <Image style={styles.img} source={require('../img/down_arrow.png')}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {if (!this.solutionMode) this.hardDrop()}}>
                    <Image style={styles.img} source={require('../img/up_arrow.png')}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {if (!this.solutionMode) this.rotate(-1)}}>
                    <Image style={styles.img} source={require('../img/rotate_arrow.png')}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {if (!this.solutionMode) this.rotate(1)}}>
                    <Image style={styles.img} source={require('../img/rotate_right_arrow.png')}/>
                </TouchableOpacity>
            </View>
        )
    }

    renderStart() {
            if ((this.state.started && this.state.score < 4000) || this.solutionMode) {
              if (this.state.gameOver){
                 this.streak = 0;
                 this.won = false;
                 this.solutionMode = !this.solutionMode;
                 this.gravityOn = this.solutionMode || this.props.gravity;
              }
              return (
                  <Modal
                      animationType={"slide"}
                      transparent={false}
                      visible={this.state.gameOver}
                      style={{flex: 1}}
                  >
                  <View style={{ flex: 1}}>
                    <WebView
                      source={{uri: this.state.url}}
                      style={{marginTop: 20}}
                    />
                  <View style={{position:'absolute',right:0,marginTop:700,marginRight:50}}>
                    <TouchableOpacity onPress={() => {this.state.started ? this.tryAgain() : this.startGame()}}>
                        <Text style={{fontSize: 32, color: 'black', fontWeight: '500'}}>
                            {this.state.started ? 'TRY AGAIN' : 'START'}</Text>
                    </TouchableOpacity>
                  </View>
                 </View>
                </Modal>
              )
            } else if ( this.state.score >= 4000 ){
              if (this.state.gameOver){
                 this.streak++;
                 this.won = true;
              }
              return (
                  <Modal
                      animationType={"slide"}
                      transparent={true}
                      visible={this.state.gameOver}
                      style={{flex: 1}}
                  >
                      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'rgba(0,0,0,.5)'}}>
                          <Text style={{fontSize: 32, fontWeight: '800'}}>
                              <Text style={{color: 'blue'}}>P</Text>
                              <Text style={{color: 'orange'}}>E</Text>
                              <Text style={{color: 'yellow'}}>R</Text>
                              <Text style={{color: 'green'}}>F</Text>
                              <Text style={{color: 'red'}}>E</Text>
                              <Text style={{color: 'cyan'}}>C</Text>
                              <Text style={{color: 'blue'}}>T</Text>
                              <Text style={{color: 'orange'}}>C</Text>
                              <Text style={{color: 'yellow'}}>L</Text>
                              <Text style={{color: 'green'}}>E</Text>
                              <Text style={{color: 'red'}}>A</Text>
                              <Text style={{color: 'cyan'}}>R</Text>
                          </Text>

                          <TouchableOpacity onPress={() => {this.state.started ? this.tryAgain() : this.startGame()}}>
                              <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                  {this.state.started ? 'TRY AGAIN' : 'START'}</Text>
                          </TouchableOpacity>
                      </View>
                  </Modal>
              )
          } else {
            return (<Modal
                animationType={"slide"}
                transparent={true}
                visible={this.state.gameOver}
                style={{flex: 1}}
            >
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'rgba(0,0,0,.5)'}}>
                    <Text style={{fontSize: 64, fontWeight: '800'}}>
                        <Text style={{color: 'blue'}}>T</Text>
                        <Text style={{color: 'orange'}}>E</Text>
                        <Text style={{color: 'yellow'}}>T</Text>
                        <Text style={{color: 'green'}}>R</Text>
                        <Text style={{color: 'red'}}>I</Text>
                        <Text style={{color: 'cyan'}}>S</Text>
                    </Text>

                    <TouchableOpacity onPress={() => {this.state.started ? this.tryAgain() : this.startGame()}}>
                        <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                            {this.state.started ? 'TRY AGAIN' : 'START'}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )
          }
    }

    renderPause(){
        if(!this.state.help){
            return (
                    <Modal
                        animationType={"slide"}
                        transparent={false}
                        visible={this.state.paused}
                        style={{flex: 1}}
                    >
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'#374785'}}>
                            <Text style={{fontSize: 64, fontWeight: '800'}}>Paused</Text>
                            <TouchableOpacity onPress={() => {this.setState({paused: false})}}>
                                <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                    resume</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {this.tryAgain(); this.setState({paused: false});}}>
                                <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                    restart</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigate('Settings', {gravity: this.state.gravity, startingPieces: this.state.init})}>
                                <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                    setting</Text>
                            </TouchableOpacity>

                        </View>
                    </Modal>
                )
        }
        else{
            return (
                    <Modal
                        animationType={"slide"}
                        transparent={true}
                        visible={this.state.paused&&this.state.help}
                        style={{flex: 1}}
                    >
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'rgba(0,0,0,.5)'}}>
                            <Text style={{fontSize: 64, fontWeight: '800'}}>Help</Text>
                            <TouchableOpacity onPress={() => {this.setState({paused: false, help: false})}}>
                                <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                    resume</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {this.setState({paused: false, help: false}); this.tryAgain()}}>
                                <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                    restart</Text>
                            </TouchableOpacity>


                        </View>
                    </Modal>
                )
        }

    }



ButtonClickCheckFunction = () =>{

    this.setState({paused: true});

  }

HelpButtonClicked = () =>{

    this.setState({paused: true});
    this.setState({help: true});

  }

HoldPiece() {
    if (this.hardDropActive || this.sonicDropActive)
        return;

    if(!this.held){

        var newholdPiece = this.state.holdPiece;

        if(newholdPiece[0].id==-1){
            newholdPiece = [{id:this.id++, type:this.currentBlock, color: this.typeColorDict[this.currentBlock]}];
            // console.log("holding:" + newholdPiece);

            var {blocks} = this.state;
            var next = blocks.splice(0,1)[0];

            this.currentBlock = next.type;

        }
        else{
            //TODO: allow only one hold press
            var temp = newholdPiece[0].type;
            newholdPiece =[{id:this.id++, type:this.currentBlock, color: this.typeColorDict[this.currentBlock]}];
            // console.log("holding2:" + newholdPiece[0].type);
            this.currentBlock = temp;
        }


        this.setState({holdPiece:newholdPiece});

        this.clearCurrentPiece();

        this.loadNextBlockHelper(this.currentBlock);
        this.held = true;
    }

  }

  renderHoldView(){
        if(this.state.holdPiece[0].id!='-1'){
            return <Preview blocks={this.state.holdPiece} />
        }
  }

  giveUp() {
      this.setState({gameOver: true})
  }
screenPress(evt) {
    if (evt.nativeEvent.locationX < Dimensions.get('window').width / 2)
        this.rotate(-1);
    else
        this.rotate(1);
}


swipeUp(evt) {
    this.hardDrop();
}

swipeDown(evt) {
    if (this.sonicDropSetting) {
        this.sonicDrop();
        return;
    }
    var swipes = Math.max(1, Math.floor(evt.dy / 24));
    this.tickCount = swipes;
    this.resetInterval(swipes);
}

swipeLeft(evt) {
    this.shiftCells('left');
}

swipeRight(evt) {
    this.shiftCells('right');
}

    render() {
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 80
        };
        return (
          <TouchableWithoutFeedback onPress={evt => {if (!this.solutionMode) this.screenPress(evt)}}>
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between',}}>

            <View style={{flex: 1, flexDirection: 'row'}}>
                      <View style={{width: '70%', height:60, backgroundColor: '#f76c6c', padding:10, borderBottomRightRadius: 10, alignItems: 'flex-end'}}>
                        <Text style={{fontWeight: '700', fontSize: 26, color: 'white'}}>PERFECT CLEAR</Text>
                      </View>
                      <TouchableOpacity style={{width: 40 , height:40, margin:5, marginLeft:10, backgroundColor: '#fbe9a3', justifyContent: 'center', alignItems: 'center', borderRadius:10,}} onPress={ this.ButtonClickCheckFunction }>
                      <Text style={{fontWeight: '900', fontSize: 18, color:'#374785'}}>||</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={{width: 40 , height:40, margin:5, backgroundColor: '#fbe9a3', justifyContent: 'center', alignItems: 'center', borderRadius:10,}} onPress={ this.HelpButtonClicked }>
                      <Text style={{fontWeight: '900', fontSize: 20, color:'#374785'}}>?</Text>
                      </TouchableOpacity>

            </View>
            <View style={{flex: 1, flexDirection: 'row'}}>
                      <View style={{width: '70%', height:60, backgroundColor: '#f76c6c', padding:10, borderBottomRightRadius: 10, alignItems: 'flex-end'}}>
                        <Text style={{fontWeight: '700', fontSize: 26, color: 'white'}}> STREAK: {this.streak}</Text>
                      </View>
            </View>

          <GestureRecognizer style={styles.container} onSwipeUp={evt => {if (!this.solutionMode) this.swipeUp(evt)}} onSwipeDown={evt => {if (!this.solutionMode) this.swipeDown(evt)}} onSwipeLeft={evt => {if (!this.solutionMode) this.swipeLeft(evt)}} onSwipeRight={evt => {if (!this.solutionMode) this.swipeRight(evt)}} config={config}>
          <TouchableWithoutFeedback onPress={evt => {if (!this.solutionMode) this.screenPress(evt)}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between',  backgroundColor: '#374785', padding: 30, paddingTop: 60, borderTopRightRadius: 10, borderTopLeftRadius:10}}>
                    <View pointerEvents={'auto'} style = {{marginRight: 35}}>
                        <Text style={{fontWeight: '700', color: 'white'}}>HOLD</Text>
                        <TouchableOpacity style={{backgroundColor: '#374785', width: 40, height: 40}} onPress={ () => {if (!this.solutionMode) this.HoldPiece() }}>
                            {this.renderHoldView()}
                        </TouchableOpacity>

                    </View>
                    <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
                    <View pointerEvents={'none'}>
                        {this.renderCells()}
                        </View>
                        <TouchableOpacity style={{ backgroundColor:'#00A99D', borderRadius:20, padding:10, paddingLeft:30, paddingRight:30, margin:15}} onPress={() => {if (!this.solutionMode) this.giveUp()}}>
                          <Text style={{color:'white',fontWeight: '500', fontSize: 15,}}>I GIVE UP :(</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{marginLeft: 20, alignItems: 'center'}}>
                        <Text style={{fontWeight: '700', color: 'white'}}>NEXT</Text>
                        <Preview blocks={this.state.blocks.slice(0, this.state.numPreviews)}/>
                    </View>
                </View>
          </TouchableWithoutFeedback>
          </GestureRecognizer>
                {this.renderButtons()}
                {this.renderStart()}
                {this.renderPause()}

            </View>
          </TouchableWithoutFeedback>
        )
    }
}

var styles = StyleSheet.create({
    img: {
        width: 50,
        height: 50
    }
})
