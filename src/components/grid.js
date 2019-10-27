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
TouchableOpacity
} from 'react-native';

import CreateBlock from './create_block';


import Cell from './cell';
import Preview from './preview';
import {belongs, createRandomBlock, createInit, generateSolution, createBlock, getRandomInt} from './helpers';
import {rotate} from './rotation';


export default class Grid extends Component {



    constructor(props) {
        super(props);
        this.state = {
            w: props.w,
            h: props.h,
            grid: [],
            blocks: [],
            numBlocks: 5,
            score: 0,
            started: false,
            gameOver: true,
            solutionVisible: false,
            init: props.init,
            url: "https://google.com",
            numRounds: 0,
            holdPiece: [{id:-1, type:'', color: ''}],
            numPreviews: 5,
            paused: false,
            settingOpen: false,
        }

        this.grid = [];
        this.currentBlock = 'J';
        this.rotation = 0;
        this.speed = 450;
        this.changeColor = this.changeColor.bind(this);
        this.checkColor = this.checkColor.bind(this);
        this.held = false;

        this.typeColorDict = {'I':'skyblue', 'O':'yellow', 'T':'purple', 'S':'green', 'Z':'red', 'J':'blue', 'L':'orange'};




    }

    componentDidMount() {
        this.setState({blocks: this.generateBlocks(0)}, () => this.createGrid());
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
        this.setState({gameOver: false, started: true, score: 0, numRounds: 0, url: this.url, holdPiece: [{id:-1, type:'', color: ''}]},
          () => this.loadNextBlock());
        clearInterval(this.interval);
        this.initPerfectClear();
        this.interval = setInterval(() => {
            this.tick()
        }, this.speed)
    }

    tryAgain() {
        this.setState({gameOver: false, score: 0, blocks: this.generateBlocks(0), }, () => {
            this.refresh();
            this.startGame()
        });
    }

    refresh() {
        for(i = 4; i < 24; i++) {
            for(j = 0; j < 10; j++) {
                this.changeColor(i, j, 'white');
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
        var bin = color == 'white' ? 0 : 1;
        this.grid[i][j] = bin;
        this.refs[id].changeColor(color);
    }

    down() {
        clearInterval(this.interval);
        this.speed = 10;
        this.interval = setInterval(() => {
            this.tick()
        }, this.speed)
    }

    rotate() {

        if(this.grid[3].includes(1)) {
            return
        }

        this.rotation += 1;
        var color;
        var points = [];
        var previous = [];
        for(i = 4; i < 24; i++) { //h is 20, so i want 20 rows
            for(j = 0; j < 10; j++) { // w is 10
                if(belongs(this.checkColor(i, j))){
                    color = this.checkColor(i,j);
                    this.changeColor(i,j, 'white');
                    points.push([i, j]);
                    previous.push([i,j]);
                }
            }
        }

        var rotated = rotate(this.currentBlock, points, this.rotation);
        if(this.canRotate(rotated)) {
            // console.log('valid rotation');
            rotated.map((point) => {
                this.changeColor(point[0], point[1], color);
            });
        } else {
            // console.log('invalid rotation');
            previous.map((point) => {
                this.changeColor(point[0], point[1], color);
            });
        }

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
        var shift = direction == 'left' ? -1 : 1;
        if (direction == 'right') {
            points = points.reverse();
        }
        points.map((point) => {
            this.changeColor(point.i, point.j + shift, this.checkColor(point.i, point.j));
            this.changeColor(point.i, point.j, 'white');
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
            this.changeColor(3, 3, blockColor);
            this.changeColor(3, 4, blockColor);
            this.changeColor(3, 5, blockColor);
            this.changeColor(3, 6, blockColor);
        } else if(type == 'O') {
            this.changeColor(2, 4, blockColor);
            this.changeColor(2, 5, blockColor);
            this.changeColor(3, 4, blockColor);
            this.changeColor(3, 5, blockColor);
        } else if(type == 'T') {
            this.changeColor(2, 4, blockColor);
            this.changeColor(3, 3, blockColor);
            this.changeColor(3, 4, blockColor);
            this.changeColor(3, 5, blockColor);
        } else if(type == 'S') {
            this.changeColor(2, 4, blockColor);
            this.changeColor(2, 5, blockColor);
            this.changeColor(3, 3, blockColor);
            this.changeColor(3, 4, blockColor);
        } else if(type == 'Z') {
            this.changeColor(2, 3, blockColor);
            this.changeColor(2, 4, blockColor);
            this.changeColor(3, 4, blockColor);
            this.changeColor(3, 5, blockColor);
        } else if(type == 'J') {
            this.changeColor(2, 3, blockColor);
            this.changeColor(3, 3, blockColor);
            this.changeColor(3, 4, blockColor);
            this.changeColor(3, 5, blockColor);
        } else if(type == 'L') {
            this.changeColor(2, 5, blockColor);
            this.changeColor(3, 3, blockColor);
            this.changeColor(3, 4, blockColor);
            this.changeColor(3, 5, blockColor);
        }

        var {blocks} = this.state;
        this.generateBlocks(blocks);
    }

    loadNextBlock() {
        this.speed = 450;
        clearInterval(this.interval);
        this.interval = setInterval(() => {
            this.tick()
        }, this.speed);


        var {blocks} = this.state;
        var next = blocks.splice(0,1)[0];

        this.held = false;

        this.loadNextBlockHelper(next.type);


    }

    generateBlocks() {

        var blocks = [];
        var solution_url = generateSolution(this.state.init);
        var solution = solution_url[0];
        var url = solution_url[1];
        this.url = url;
        for(i = 0; i < solution.length; i++) {
           blocks.push({id: i, ...createBlock(solution.charAt(i))});
        }
        if (blocks.length < 5) {
          blocks.push({id: i, ...createRandomBlock()});
        }
        return blocks;
    }

    toString() {
        for (i = 0; i < 24; i++ ) {
            console.log(this.grid[i])
        }


    }

    clearRow(row) {
        console.log('clearing row', row);
        for (j = 0; j < 10; j++){
            this.changeColor(row, j, 'white');
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
        for (i = 23; i >= 4; i--) {
            if(!this.grid[i].includes(0)) {
                console.log('adding row', i);
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
            if(this.checkColor(point.i, point.j) != 'white' && this.checkColor(point.i, point.j) != 'gray') {
                //active piece
                this.changeColor(point.i, point.j, 'white');
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
            this.changeColor(point.i, point.j, 'white');
        })

    }


    tick() {
        if(!this.state.paused){
            var points = [];
            const {grid, w, h} = this.state;
            for(i = 23; i >= 0; i--) { //h is 20, so i want 20 rows
                for(j = 9; j >= 0; j--) { // w is 10
                    if(belongs(this.checkColor(i,j))){
                        points.push({i, j});
                    }
                }
            }

            var can = this.canMoveDown(points);
            if(can){
                this.moveDown(points);
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
                console.log('game over');
                return
            }

            if(!can) {
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
                    this.setState({gameOver:true});
                  } else if (this.state.numRounds >= 4 && this.state.init >= 2){
                    this.setState({gameOver:true});
                  } else {
                    this.loadNextBlock();
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
                            var color = 'white';
                            return <TouchableOpacity key={j} onPress={() => this.changeColor(i, j, 'blue')}>
                                <Cell ref={i + ',' + j} color={color} size={size}/>
                            </TouchableOpacity>
                        })}
                    </View>
                )
            }

            return (
                <View key={i} style={{flexDirection: 'row'}}>
                    {row.map((cell, j) => {
                        // console.log('color is:', cell)
                        var color = 'white';
                        if(cell == 1) {
                            color = 'blue';
                        } else if(cell == 2) {
                            color = 'green';
                        }

                        if(i < 4) {
                            color = 'red';
                        }

                        return <TouchableOpacity key={j} onPress={() => {
                            return //production
                            this.changeColor(i, j, 'blue')
                        }}>
                            <Cell ref={i + ',' + j} borderWidth={1} color={color} size={size}/>
                        </TouchableOpacity>
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
                  <View style={{position:'absolute',right:0,marginBottom:90,marginRight:10}}>
                    <TouchableOpacity onPress={() => {this.state.started ? this.tryAgain() : this.startGame()}}>
                        <Text style={{fontSize: 32, color: 'black', fontWeight: '500'}}>
                            {this.state.started ? 'TRY AGAIN' : 'START'}</Text>
                    </TouchableOpacity>
                  </View>
                 </View>
                </Modal>
              )
            } else if ( this.state.score >= 4000 ){
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

    renderSolution() {
            return (
                <Modal
                    animationType={"slide"}
                    transparent={false}
                    visible={this.state.numRounds > 3}
                    style={{flex: 1}}
                >
                <WebView
                  source={{uri: this.state.url}}
                  style={{marginTop: 20}}
                />
                </Modal>
            )
    }

    renderPause(){
        return (
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.paused&&!this.state.settingOpen}
                    style={{flex: 1}}
                >
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'rgba(0,0,0,.5)'}}>
                        <Text style={{fontSize: 64, fontWeight: '800'}}>Paused</Text>
                        <TouchableOpacity onPress={() => {this.setState({paused: false})}}>
                            <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                resume</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {this.tryAgain(); this.setState({paused: false});}}>
                            <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                restart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {this.setState({settingOpen: true})}}>
                            <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                                settings</Text>
                        </TouchableOpacity>

                    </View>
                </Modal>
            )

    }

    renderSetting(){
        return (
            <Modal
                animationType={"slide"}
                transparent={true}
                visible={this.state.settingOpen}
                style={{flex: 1}}
            >
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor:'rgba(0,0,0,.5)'}}>
                    <Text style={{fontSize: 64, fontWeight: '800'}}>Setting</Text>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                            gravity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={{fontSize: 32, color: 'white', fontWeight: '500'}}>
                            starter</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        )

    }

ButtonClickCheckFunction = () =>{

    this.setState({paused: true});

  }

HelpButtonClicked = () =>{

    Alert.alert("Button Clicked")
    this.setState({paused: true});

  }

HoldPiece = () =>{

    if(!this.held){

        var newholdPiece = this.state.holdPiece;

        if(newholdPiece[0].id==-1){
            newholdPiece = [{id:0, type:this.currentBlock, color: this.typeColorDict[this.currentBlock]}];
            console.log("holding:" + newholdPiece);

            var {blocks} = this.state;
            var next = blocks.splice(0,1)[0];

            this.currentBlock = next.type;

        }
        else{
            //TODO: allow only one hold press
            var temp = newholdPiece[0].type;
            newholdPiece =[{id:(newholdPiece[0].id+1)%2, type:this.currentBlock, color: this.typeColorDict[this.currentBlock]}];
            console.log("holding2:" + newholdPiece[0].type);
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

    render() {
        return (
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between',}}>

            <View style={{flex: 1, flexDirection: 'row'}}>
                      <View style={{width: '70%', height:60, backgroundColor: '#f76c6c', padding:10, borderBottomRightRadius: 10, alignItems: 'flex-end'}}>
                        <Text style={{fontWeight: '700', fontSize: 26, color: 'white'}}>PERFECT CLEAR</Text>
                      </View>
                      <TouchableOpacity style={{width: 40 , height:40, margin:5, backgroundColor: '#fbe9a3', justifyContent: 'center', alignItems: 'center', borderRadius:10,}} onPress={ this.ButtonClickCheckFunction }>
                      <Text>||</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={{width: 40 , height:40, margin:5, backgroundColor: '#fbe9a3', justifyContent: 'center', alignItems: 'center', borderRadius:10,}} onPress={ this.HelpButtonClicked }>
                      <Text>?</Text>
                      </TouchableOpacity>

            </View>

                <View style={{flexDirection: 'row', justifyContent: 'center', backgroundColor: '#364785', padding: 60, borderTopRightRadius: 10, borderTopLeftRadius:10}}>
                    <View >
                        <Text>HOLD</Text>
                        <TouchableOpacity style={{backgroundColor: 'white', width: 40, height: 40}} onPress={ this.HoldPiece }>
                            {this.renderHoldView()}
                        </TouchableOpacity>

                    </View>
                    <View style={{backgroundColor: '#24305e'}}>
                        {this.renderCells()}
                    </View>
                    <View style={{marginLeft: 20, alignItems: 'center'}}>
                        <Text style={{fontSize: 16, fontWeight: '600'}}>NEXT</Text>
                        <Preview blocks={this.state.blocks}/>
                    </View>
                </View>
                {this.renderButtons()}
                {this.renderStart()}
                {this.renderPause()}
                {this.renderSetting()}

            </View>
        )
    }
}

var styles = StyleSheet.create({
    img: {
        width: 50,
        height: 50
    }
})
