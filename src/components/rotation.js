/**
 * Created by ggoma on 2016. 11. 23..
 */

function sortPoints(p, q) {
  return p[0] != q[0] ? p[0] - q[0] : p[1] - q[1];
}

// dir: left = -1, right = 1, flip = 2, none = 0
export function rotate(type, p, rotation, dir) {
  if (type == 'O' || dir == 0)
    return p;
  center = [];
  if (type == 'I') {
    center = [p[1][0]+0.5, p[1][1]+0.5];
    if (rotation == 1)
      center[1]--;
    if (rotation == 2)
      center[0]--;
  } else {
    index = [2, 1, 1, 2];
    if (type == 'J')
      index = [2, 2, 1, 1];
    if (type == 'S')
      index = [3, 1, 0, 2];
    center = p[index[rotation]];
  }
  let output;
  if (dir == 1)
    output = p.map(q => [q[1]-center[1]+center[0], -(q[0]-center[0])+center[1]]);
  else if (dir == -1)
    output = p.map(q => [-(q[1]-center[1])+center[0], q[0]-center[0]+center[1]]);
  else // dir == 2
    output = p.map(q => [-(q[0]-center[0])+center[0], -(q[1]-center[1])+center[1]]);
  return output.sort(this.sortPoints);
}

export function srs(type, rotation, dir, test) {
  table = [[[[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
             [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]]],
            [[[0,0],[1,0],[1,-1],[0,2],[1,2]],
             [[0,0],[1,0],[1,-1],[0,2],[1,2]]],
            [[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
             [[0,0],[1,0],[1,1],[0,-2],[1,-2]]],
            [[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
             [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]]],
           [[[[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
             [[0,0],[-2,0],[1,0],[-2,-1],[1,2]]],
            [[[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
             [[0,0],[-1,0],[2,0],[-1,2],[2,-1]]],
            [[[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
             [[0,0],[2,0],[-1,0],[2,1],[-1,-2]]],
            [[[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
             [[0,0],[1,0],[-2,0],[1,-2],[-2,1]]]]];
  const pair = table[type == 'I' ? 1 : 0][rotation][dir == 1 ? 1 : 0][test];
  return [-pair[1], pair[0]];
}

export function rotateSRS(field, type, piece, rotation, dir) {
  const rotatedPiece = rotate(type, piece, rotation, dir);
  for (let test = 0; test < 5; test++) {
    const shift = srs(type, rotation, dir, test);
    const shiftedPiece = rotatedPiece.map(point => [point[0] + shift[0], point[1] + shift[1]]);
    if (shiftedPiece.every(point => field[point[0]] && !field[point[0]][point[1]]))
        return shiftedPiece;
  }
  return piece;
}
