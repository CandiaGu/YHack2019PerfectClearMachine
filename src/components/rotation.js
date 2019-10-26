/**
 * Created by ggoma on 2016. 11. 23..
 */
// dir: left = -1, right = 1
export function rotate(type, p, rotation, dir) {
    if (type == 'O')
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
    if (dir == 1)
      return p.map(q => [q[1]-center[1]+center[0], -(q[0]-center[0])+center[1]]);
    else
      return p.map(q => [-(q[1]-center[1])+center[0], q[0]-center[0]+center[1]]);
}
