/**
 * Created by ggoma on 2016. 11. 23..
 */
import {loadSolutions} from './solutions';
const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const colors = ['yellow', 'purple', 'red', 'blue', 'orange', 'green', 'skyblue']
var sols = []

export function createInit(type) {
  var matrix = [];
  if (type == 0) {
    for(i = 20; i < 24; i++) {
        for(j = 0; j < 4; j++) {
            matrix.push([i,j]);
        }
        if ( i == 20 ) {
          for (j = 9; j > 7; j--){
            matrix.push([i,j]);
          }
        }
        if ( i == 21 || i == 23 ) {
          for (j = 9; j > 6; j--){
            matrix.push([i,j]);
          }
        }
        if ( i == 22) {
          for (j = 9; j > 5; j--){
            matrix.push([i,j]);
          }
        }
    }
  } else if (type == 1) {
    for(i = 20; i < 24; i++) {
        for(j = 9; j > 5; j--) {
            matrix.push([i,j]);
        }
        if ( i == 20 ) {
          for (j = 0; j < 2; j++){
            matrix.push([i,j]);
          }
        }
        if ( i == 21 || i == 23 ) {
          for (j = 0; j < 3; j++){
            matrix.push([i,j]);
          }
        }
        if ( i == 22) {
          for (j = 0; j < 4; j++){
            matrix.push([i,j]);
          }
        }
    }
  } else if (type == 2) {
    for(i = 20; i < 24; i++) {
        for(j = 0; j < 3; j++) {
            matrix.push([i,j]);
        }
        if ( i == 20 ) {
          for (j = 9; j > 7; j--){
            matrix.push([i,j]);
          }
        }
        if ( i == 21 || i == 23 ) {
          for (j = 9; j > 6; j--){
            matrix.push([i,j]);
          }
        }
        if ( i == 22) {
          for (j = 9; j > 5; j--){
            matrix.push([i,j]);
          }
        }
    }
  } else if (type == 3) {
    for(i = 20; i < 24; i++) {
        for(j = 9; j > 6; j--) {
            matrix.push([i,j]);
        }
        if ( i == 20 ) {
          for (j = 0; j < 2; j++){
            matrix.push([i,j]);
          }
        }
        if ( i == 21 || i == 23 ) {
          for (j = 0; j < 3; j++){
            matrix.push([i,j]);
          }
        }
        if ( i == 22) {
          for (j = 0; j < 4; j++){
            matrix.push([i,j]);
          }
        }
    }
  } else if (type == 4) {
    for(i = 20; i < 24; i++) {
        for(j = 0; j < 3; j++) {
            matrix.push([i,j]);
        }
        for(j = 9; j > 6; j--) {
            matrix.push([i,j]);
        }
    }
  }

  return matrix;
}

export function generateSolution(type) {

  if (sols.length == 0) {
    sols = loadSolutions();
  }
  var keys = Object.keys(sols[type]);
  const j = getRandomInt(0,keys.length);
  var x = keys[j];
  var url = sols[type][keys[j]];

  return [x, url];

}

export function createBlock(type) {
  var object = {
    type: type,
    color: colors[getRandomInt(0,7)]
  }
  return object;

}

export function createRandomBlock() {
    var object = {
        type: types[getRandomInt(0, 7)],
        color: colors[getRandomInt(0, 7)]
    };

    return object;

}

export function belongs(color) {
    return colors.includes(color);
}

export function rotate(array) {
    console.log(array);
    var m = array.length;
    var n = array[0].length;
    var matrix = [],
        cols = 3;
    //init the grid matrix
    for ( var i = 0; i < m; i++ ) {
        matrix[i] = [];
    }
    for (i = 0; i < m; i++){
        for (j = 0; j < n; j++) {
            matrix[j][m - 1 - i] = array[i][j];
        }
    }

    return matrix;
}
//
// static int[][] rotateCW(int[][] mat) {
//     final int M = mat.length;
//     final int N = mat[0].length;
//     int[][] ret = new int[N][M];
//     for (int r = 0; r < M; r++) {
//         for (int c = 0; c < N; c++) {
//             ret[c][M-1-r] = mat[r][c];
//         }
//     }
//     return ret;
// }

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
