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
            init: props.init,
            gravity: props.gravity,
            url: "https://google.com",
            numRounds: 0,
            numPreviews: 5,
            paused: false,
            settingOpen: false
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

        this.typeColorDict = {'I':'skyblue', 'O':'yellow', 'T':'purple', 'S':'green', 'Z':'red', 'J':'blue', 'L':'orange'};



    }

    componentDidMount() {
        this.setState({blocks: this.generateBlocks()}, () => this.createGrid());
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
        });
    }

    initPerfectClear() {
      x = createInit(this.state.init);
      for (i = 0; i < x.length; i++){
        this.changeColor(x[i][0], x[i][1], 'gray');
      }
    }

    startGame() {
        this.setState({gameOver: false, started: true, score: 0, numRounds: 0, url: this.url},
          () => this.loadNextBlock());
        clearInterval(this.interval);
        this.initPerfectClear();
        this.interval = setInterval(() => {
            this.tick()
        }, this.gravity)
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
                this.changeColor(i, j, '#24305e');
            }
        }
        //this.state.holdPiece = null;
    }

    hardDrop() {
       clearInterval(this.interval);
       this.interval = setInterval(() => {
           this.tick()
       }, 1)
   }

   softDrop() {
       this.tick();
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
        var bin = color == '#24305e' ? 0 : 1;
        this.grid[i][j] = bin;
        this.refs[id].changeColor(color);
    }

    hardDrop() {
        clearInterval(this.interval);
        this.gravity = 0;
        this.interval = setInterval(() => {
            this.tick()
        }, this.gravity);
    }

    softDrop() {
        this.tick();
    }

    // dir: left = -1, right = 1
    rotate(dir) {

        if(this.grid[3].includes(1)) {
            return
        }

        var color;
        var points = [];
        var previous = [];
        for(i = 4; i < 24; i++) { //h is 20, so i want 20 rows
            for(j = 0; j < 10; j++) { // w is 10
                if(belongs(this.checkColor(i, j))){
                    color = this.checkColor(i,j);
                    this.changeColor(i,j, '#24305e');
                    points.push([i, j]);
                    previous.push([i,j]);
                }
            }
        }

        var rotated = rotate(this.currentBlock, points, this.rotation, dir);
        for (test = 0; test < 5; test++) {
            shift = srs(this.currentBlock, this.rotation, dir, test);
            srotated = rotated.map(p => [p[0]-shift[1], p[1]+shift[0]]);
            if(this.canRotate(srotated)) {
                this.movedPiece = true;
                this.rotation = (this.rotation + dir + 4) % 4;
                // console.log('valid rotation');
                srotated.map((point) => {
                    this.changeColor(point[0], point[1], color);
                });
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
        this.movedPiece = true;
        var shift = direction == 'left' ? -1 : 1;
        if (direction == 'right') {
            points = points.reverse();
        }
        points.map((point) => {
            this.changeColor(point.i, point.j + shift, this.checkColor(point.i, point.j));
            this.changeColor(point.i, point.j, '#24305e');
        })
    }


    shiftCells(direction) {

        var points = [];
        for(i = 4; i < 24; i++) { //h is 20, so i want 20 rows
            for(j = 0; j < 10; j++) { // w is 10
                if(belongs(this.checkColor(i, j))){
                    if(i == 4) {
                        return
                    }
                    points.push({i, j});
                }
            }
        }


        var can = this.canShift(points, direction);
        if(can) {
            this.shift(points, direction);
        }


    }


    loadNextBlockHelper(type){

        this.currentBlock = type;
        var blockColor = this.typeColorDict[type];
        this.rotation = 0;
        if(type == 'I') {
            this.changeColor(5, 3, blockColor);
            this.changeColor(5, 4, blockColor);
            this.changeColor(5, 5, blockColor);
            this.changeColor(5, 6, blockColor);
        } else if(type == 'O') {
            this.changeColor(4, 4, blockColor);
            this.changeColor(4, 5, blockColor);
            this.changeColor(5, 4, blockColor);
            this.changeColor(5, 5, blockColor);
        } else if(type == 'T') {
            this.changeColor(4, 4, blockColor);
            this.changeColor(5, 3, blockColor);
            this.changeColor(5, 4, blockColor);
            this.changeColor(5, 5, blockColor);
        } else if(type == 'S') {
            this.changeColor(4, 4, blockColor);
            this.changeColor(4, 5, blockColor);
            this.changeColor(5, 3, blockColor);
            this.changeColor(5, 4, blockColor);
        } else if(type == 'Z') {
            this.changeColor(4, 3, blockColor);
            this.changeColor(4, 4, blockColor);
            this.changeColor(5, 4, blockColor);
            this.changeColor(5, 5, blockColor);
        } else if(type == 'J') {
            this.changeColor(4, 3, blockColor);
            this.changeColor(5, 3, blockColor);
            this.changeColor(5, 4, blockColor);
            this.changeColor(5, 5, blockColor);
        } else if(type == 'L') {
            this.changeColor(4, 5, blockColor);
            this.changeColor(5, 3, blockColor);
            this.changeColor(5, 4, blockColor);
            this.changeColor(5, 5, blockColor);
        }
        var {blocks} = this.state;
        this.setState({blocks});
    }

    loadNextBlock() {
        clearInterval(this.interval);
        this.gravity = this.gravityOn ? 1000 : 1;
        this.interval = setInterval(() => {
            this.tick()
        }, this.gravity);


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

    clearRow(row) {
        // console.log('clearing row', row);
        for (j = 0; j < 10; j++){
            this.changeColor(row, j, '#24305e');
        }

        for (i = row; i >= 4; i--) {
            for (k = 0; k < 10; k++) {
                if(this.checkColor(i-1, k) != null) {
                    this.changeColor(i, k, this.checkColor(i-1, k));
                }
            }
            // if(this.grid[i-1] != null && !this.grid[i-1].includes(1)) {
            //     console.log('breaking on row', i);
            //     break;
            // }
        }


    }

    checkRowsToClear() {
        clearInterval(this.interval);
        var row_was_cleared = false;
        var num_rows_cleared = 0;
        var rows_to_clear = [];
        for (i = 4; i <= 23; i++) {
            if(!this.grid[i].includes(0)) {
                // console.log('adding row', i);
                rows_to_clear.push(i);
            }
        }

        rows_to_clear.map((r) => {
            this.clearRow(r);
            num_rows_cleared++;
            row_was_cleared = true;
        });

        if(row_was_cleared) {
            this.setState({score: this.state.score + 1000 * num_rows_cleared});
        }
    }

    clearCurrentPiece(){
        var points = [];
        const {grid, w, h} = this.state;
        for(i = 23; i >= 0; i--) { //h is 20, so i want 20 rows
            for(j = 9; j >= 0; j--) { // w is 10
                if(belongs(this.checkColor(i,j))){
                    points.push({i, j});
                }
            }
        }
        points.map(point => {
            if(this.checkColor(point.i, point.j) != '#24305e' && this.checkColor(point.i, point.j) != 'gray') {
                //active piece
                this.changeColor(point.i, point.j, '#24305e');
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
            this.changeColor(point.i, point.j, '#24305e');
        })

    }


    tick() {
        if(!this.state.paused){
            var points = [];
            const {grid, w, h} = this.state;
        if (this.tickCount > 0) {
            this.tickCount--;
            if (this.tickCount == 0) {
                clearInterval(this.interval);
                this.interval = setInterval(() => {
                    this.tick()
                }, this.gravity);
            }
        }
        var highest = 24;
        for(i = 23; i >= 0; i--) { //h is 20, so i want 20 rows
            for(j = 9; j >= 0; j--) { // w is 10
                if(belongs(this.checkColor(i,j))){
                    points.push({i, j});
                    highest = Math.min(highest, i);
                }
            }
        }

        var can = this.canMoveDown(points);
        if(can){
            this.moveDown(points);
            if (!this.gravityOn && highest == 4 && this.gravity > 0) {
                clearInterval(this.interval);
                this.gravity = Math.pow(2, 31) - 1;
                this.interval = setInterval(() => {
                    this.tick()
                }, this.gravity);
            }
        };

            if(!can && this.grid[3].includes(1)) {
                clearInterval(this.interval);
                for(i = 23; i >= 0; i--) { //h is 20, so i want 20 rows
                    for(j = 9; j >= 0; j--) { // w is 10
                        if(belongs(this.checkColor(i,j))){
                            // console.log('blue found on: ', i, j);
                            this.changeColor(i, j, 'gray');
                        }
                    }
                }
                this.setState({gameOver: true});
                // console.log('game over');
                return
            }
        if(!can) {
            if (this.movedPiece) {
              this.movedPiece = false;
              return;
            }
                for(i = 23; i >= 0; i--) { //h is 20, so i want 20 rows
                    for(j = 9; j >= 0; j--) { // w is 10
                        if(belongs(this.checkColor(i,j))){
                            // console.log('blue found on: ', i, j);
                            this.changeColor(i, j, 'gray');



                        }
                    }
                }
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
                    this.tickCount = 1;
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
                            var color = '#24305e';
                                <Cell ref={i + ',' + j} color={color} size={size}/>
                        })}
                    </View>
                )
            }

            return (
                <View key={i} style={{flexDirection: 'row'}}>
                    {row.map((cell, j) => {
                        // console.log('color is:', cell)
                        var color = '#24305e';
                        if(cell == 1) {
                            color = 'blue';
                        } else if(cell == 2) {
                            color = 'green';
                        }

                        if(i < 4) {
                            color = 'red';
                        }

                        return <Cell ref={i + ',' + j} borderWidth={1} color={color} size={size}/>
                    })}
                </View>
            )
        })
    }


    renderButtons() {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <TouchableOpacity onPress={() => this.shiftCells('left')}>
                    <Image style={styles.img} source={require('../img/left-filled.png')}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.shiftCells('right')}>
                    <Image style={styles.img} source={require('../img/right-filled.png')}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.softDrop()}>
                    <Image style={styles.img} source={require('../img/down_arrow.png')}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.hardDrop()}>
                    <Image style={styles.img} source={require('../img/up_arrow.png')}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.rotate(-1)}>
                    <Image style={styles.img} source={require('../img/rotate_arrow.png')}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.rotate(1)}>
                    <Image style={styles.img} source={require('../img/rotate_right_arrow.png')}/>
                </TouchableOpacity>
            </View>
        )
    }

    renderStart() {
            if (this.state.started && this.state.score < 4000) {
              if (this.state.gameOver){
                 this.streak = 0;
                 this.won = false;
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
                            <TouchableOpacity onPress={() => this.props.navigate('Settings')}>
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
                        visible={this.state.paused&&this.help}
                        style={{flex: 1}}
                    >
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'rgba(0,0,0,.5)'}}>
                            <Text style={{fontSize: 64, fontWeight: '800'}}>Help</Text>
                            <TouchableOpacity onPress={() => {this.setState({paused: false})}}>
                                <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                    resume</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {this.tryAgain(); this.setState({paused: false});}}>
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

HoldPiece = () =>{

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

  giveUp = () => {
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
    var swipes = Math.max(1, Math.floor(evt.dy / 24));
    this.tickCount = swipes;
    clearInterval(this.interval);
    this.interval = setInterval(() => {
        this.tick()
    }, swipes)
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
          <TouchableWithoutFeedback onPress={evt => this.screenPress(evt)}>
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

          <GestureRecognizer style={styles.container} onSwipeUp={evt => this.swipeUp(evt)} onSwipeDown={evt => this.swipeDown(evt)} onSwipeLeft={evt => this.swipeLeft(evt)} onSwipeRight={evt => this.swipeRight(evt)} config={config}>
          <TouchableWithoutFeedback onPress={evt => this.screenPress(evt)}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between',  backgroundColor: '#374785', padding: 30, paddingTop: 60, borderTopRightRadius: 10, borderTopLeftRadius:10}}>
                    <View pointerEvents={'auto'} style = {{marginRight: 35}}>
                        <Text style={{fontWeight: '700', color: 'white'}}>HOLD</Text>
                        <TouchableOpacity style={{backgroundColor: '#374785', width: 40, height: 40}} onPress={ this.HoldPiece }>
                            {this.renderHoldView()}
                        </TouchableOpacity>

                    </View>
                    <View style={{flex: 1, flexDirection: 'column', alignItems: 'center'}}>
                    <View pointerEvents={'none'}>
                        {this.renderCells()}
                        </View>
                        <TouchableOpacity style={{ backgroundColor:'#00A99D', borderRadius:20, padding:10, paddingLeft:30, paddingRight:30, margin:15}} onPress={this.giveUp}>
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
