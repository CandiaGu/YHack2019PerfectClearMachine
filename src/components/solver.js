import {rotate, rotateSRS} from './rotation.js';
import solutions from '../solver/solutions.json';
import {fumenToTypes, fumenToColoredField} from './fumen.js';

let height;
let width;
let toprow;

function getPiece(config) {
  const {type, row, col, rotation} = config;
  let piece;
  switch (type) {
    case 'I': piece = [[0,-1],[0,0],[0,1],[0,2]]; break;
    case 'J': piece = [[-1,-1],[0,-1],[0,0],[0,1]]; break;
    case 'L': piece = [[-1,1],[0,-1],[0,0],[0,1]]; break;
    case 'O': piece = [[-1,0],[-1,1],[0,0],[0,1]]; break;
    case 'S': piece = [[-1,0],[-1,1],[0,-1],[0,0]]; break;
    case 'T': piece = [[-1,0],[0,-1],[0,0],[0,1]]; break;
    case 'Z': piece = [[-1,-1],[-1,0],[0,0],[0,1]];
  }
  piece = piece.map(point => [point[0] + row, point[1] + col]);
  const dir = rotation == 3 ? -1 : rotation;
  piece = rotate(type, piece, 0, dir);
  if (type == 'I') {
    const dx = dir > 0 ? -1 : 0;
    const dy = dir == -1 || dir == 2 ? -1 : 0;
    piece = piece.map(point => [point[0]+dy, point[1]+dx]);
  }
  return piece;
}

function getGhost(field, piece) {
  const bottoms = {};
  for (const point of piece) {
    const r = point[0], c = point[1];
    if (c in bottoms)
      bottoms[c] = Math.max(bottoms[c], r);
    else
      bottoms[c] = r;
  }
  let maxdrop = height;
  for (const col in bottoms) {
    let row = bottoms[col];
    while (row < height && !field[row][col])
      row++;
    maxdrop = Math.min(maxdrop, row-1-bottoms[col]);
  }
  return { 'piece':piece.map(point => [point[0]+maxdrop, point[1]]), 'dropped':maxdrop > 0 };
}

function shiftPiece(field, piece, shift) {
  let newPiece = piece.map(point => [...point]);
  for (let i = 0; i < Math.abs(shift); i++) {
    for (const point of newPiece) {
      point[1] += Math.sign(shift);
      if (field[point[0]][point[1]])
        return null;
    }
  }
  return newPiece;
}

function checkGoal(piece, goal) {
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 2; j++)
      if (piece[i][j] != goal.piece[i][j])
        return false;
  return true;
}

function movesList(val, neg, pos) {
  return Array(Math.abs(val)).fill(val < 0 ? neg : pos);
}

function findPath(field, goal) {
  const type = goal.type;
  for (const postShift of [0, -1, 1, -2, 2]) {
    for (const postDir of [0, -1, 1, 2, -2]) {
      for (const preDir of [0, 1, -1, 2]) {
        for (const preShift of [0, -1, 1, -2, 2, -3, 3]) {
          const moves = [];
          let piece = getPiece({ 'type':type, 'row':2, 'col':4, 'rotation':0 });
          // pre-rotate
          piece = rotate(type, piece, 0, preDir);
          moves.push(...movesList(preDir, 'z', 'x'));
          // pre-shift
          piece = shiftPiece(field, piece, preShift);
          if (!piece)
            continue;
          moves.push(...movesList(preShift, 'l', 'r'));
          // drop
          piece = getGhost(field, piece).piece;
          if (checkGoal(piece, goal))
            return moves.concat('u');
          moves.push('d');
          // post-rotate
          let rotation = preDir;
          for (let i = 0; i < Math.abs(postDir); i++) {
            piece = rotateSRS(field, type, piece, (rotation + 4) % 4, Math.sign(postDir));
            const ghostOutput = getGhost(field, piece);
            if (ghostOutput.dropped) {
              piece = ghostOutput.piece;
              moves.push('d');
            }
            rotation += Math.sign(postDir);
          }
          moves.push(...movesList(postDir, 'z', 'x'));
          // post-shift
          piece = shiftPiece(field, piece, postShift);
          if (!piece)
            continue;
          moves.push(...movesList(postShift, 'l', 'r'));
          // drop
          piece = getGhost(field, piece).piece;
          if (checkGoal(piece, goal))
            return moves.concat('u');
        }
      }
    }
  }
  console.log(field.join('\n'));
  console.log(goal);
  return null;
}

function validSolution(solutionTypes, types) {
  const solutionCopy = [...solutionTypes];
  const typesCopy = [...types];
  while (solutionCopy.length) {
    const type = solutionCopy.shift();
    if (typesCopy.length > 0 && typesCopy[0] == type)
      typesCopy.shift();
    else if (typesCopy.length > 1 && typesCopy[1] == type)
      typesCopy.splice(1, 1);
    else
      return false;
  }
  return true;
}

function findGroup(fieldString, types) {
  const groups = solutions[fieldString].groups;
  for (let i = groups.length-1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    const group = groups[j];
    groups[j] = groups[i];
    groups[i] = group;
    for (let k = group.group.length-1; k >= 0; k--) {
      const l = Math.floor(Math.random() * (k+1));
      const typeOrder = group.group[l];
      group.group[l] = group.group[k];
      group.group[k] = typeOrder;
      if (validSolution(typeOrder, types))
        return {group, typeOrder};
    }
  }
}

function findTypesConfigsList(fieldString, groupTypes) {
  const configsList = solutions[fieldString].configsList;
  const typesList = configsList.map(configs => configs.map(config => config.type).join(''));
  const groupTypesStr = groupTypes.join('');
  const indices = [];
  for (let i = 0; i < typesList.length; i++)
    if (typesList[i] == groupTypesStr)
      indices.push(i);
  return indices.map(i => configsList[i].map(config => ({...config})));
}

function getGoals(field, configs) {
  const goals = [];
  const f = [];
  for (const row of field)
    f.push([...row]);
  const rows = [];
  for (let i = 0; i < height; i++)
    rows.push(i);
  for (const config of configs) {
    const piece = getPiece(config);
    const goalPiece = piece.map(point => [rows[rows.length-(height-point[0])], point[1]]);
    goals.push({ 'type':config.type, 'piece':goalPiece });
    for (const row of updateField(f, piece))
      rows.splice(rows.length-(height-row), 1);
  }
  return goals;
}

function getFieldString(field) {
  let str = "";
  let i = height-1;
  for (; i >= 0; i--) {
    if (!field[i].includes(1))
      break;
    str = '\n' + field[i].map(b => b ? '*' : '_').join('') + str;
  }
  return height-1-i + str;
}

function findGoals(field, types) {
  const fieldString = getFieldString(field);
  const {group, typeOrder} = findGroup(fieldString, types);
  const groupTypes = fumenToTypes(group.fumen);
  const configsList = findTypesConfigsList(fieldString, groupTypes);
  configsList.forEach(configs => configs.forEach(config => {
    config.row = height - 1 - config.row;
    config.rotation = {'L':3, 'R':1, '2':2, '0':0}[config.rotation];
  }));
  const coloredField = fumenToColoredField(group.fumen, height, width);
  for (const configs of configsList) {
    goals = getGoals(field, configs);
    let valid = true;
    for (let i = 0; i < configs.length && valid; i++) {
      for (const point of goals[i].piece) {
        if (coloredField[point[0]][point[1]] != configs[i].type) {
          valid = false;
          break;
        }
      }
    }
    if (valid)
      return {goals, typeOrder};
  }
}

// return list of cleared row numbers in sorted order
function updateField(field, piece) {
  const rows_to_clear = new Set();
  const rows_in_piece = new Set();
  for (const point of piece) {
    field[point[0]][point[1]] = 1;
    rows_in_piece.add(point[0]);
  }
  for (let i = toprow; i < height; i++)
    if (rows_in_piece.has(i) && !field[i].includes(0))
      rows_to_clear.add(i);
  let newrow = height-1;
  let oldrow = height-1;;
  for (; newrow >= toprow && field[newrow].includes(1); newrow--, oldrow--) {
    while (oldrow >= toprow && rows_to_clear.has(oldrow))
      oldrow--;
    if (oldrow == newrow)
      continue;
    for (let j = 0; j < width; j++)
      field[newrow][j] = oldrow >= toprow && field[oldrow][j];
  }
  return [...rows_to_clear].sort();
}

function solver(field, goals, hold, nextQueue, typeOrder) {
  if (goals.length == 0)
    return [];
  for (let j = 0; j < goals.length; j++) {
    const moves = [];
    let newHold = hold;
    let newNext = nextQueue.slice(1);
    for (; j < goals.length; j++) {
      const type = goals[j].type;
      if (type != typeOrder[0])
        continue;
      if (type == nextQueue[0])
        break;
      if (type == hold || (hold == "" && nextQueue.length > 1 && type == nextQueue[1])) {
        moves.push('h');
        newHold = nextQueue[0];
        if (hold == "")
          newNext.splice(0, 1);
        break;
      }
    }
    if (j == goals.length)
      return null;
    const newGoals = JSON.parse(JSON.stringify(goals));
    const goal = newGoals.splice(j, 1)[0];
    path = findPath(field, goal);
    if (path == null)
      continue;
    moves.push(...path);
    const f = [];
    for (const row of field)
      f.push([...row]);
    for (const row of updateField(f, goal.piece))
      for (const goal of newGoals)
        for (const point of goal.piece)
          if (point[0] < row)
            point[0]++;
    const nextMoves = solver(f, newGoals, newHold, newNext, typeOrder.slice(1));
    if (nextMoves)
      return moves.concat(nextMoves);
  }
}

// outputs list of moves
// 'l' = left
// 'r' = right
// 'u' = up
// 'd' = down
// 'z' = rotate left
// 'x' = rotate right
// 'h' = hold
export function solve(fieldCoords, hold, nextQueue, h, w) {
  height = h;
  width = w;
  toprow = height - 20;
  const field = Array(height).fill(0).map(() => Array(width).fill(0));
  for (const c of fieldCoords)
    field[c[0]][c[1]] = 1;
  const {goals, typeOrder} = findGoals(field, hold == "" ? nextQueue : [hold].concat(nextQueue));
  const moves = solver(field, goals, hold, nextQueue, typeOrder);
  if (moves)
    return moves;
  else {
    console.log(hold);
    console.log(nextQueue);
    console.log(goals);
    console.log(typeOrder);
    return null;
  }
}
