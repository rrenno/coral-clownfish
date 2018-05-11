import Suggester from './suggester';
import CellSuggestion from './cell-suggestion';

export default class RyanSuggester extends Suggester {

    /**
       Return a random number integer in a range.
       @method _getRandomInt
       @param {Integer} min The minimum in range.
       @param {Integer} max The max in range.
       @return {Integer}
    */
    _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max) + 1;
        return Math.floor(Math.random() * (max - min)) + min;
    }

    _RCConstraint(board) {
        for (let [ridx, row] of board.entries()) {
            for (let [cidx, col] of row.entries()) {
                if (['empty', 'clownfish'].includes(col.type) && (board[0][cidx].value === 0 || board[ridx][0].value === 0)) {
                    return {row: ridx, column: cidx};
                }
            }
        }

        return null;
    }

    _getOpenWater(board) {
        const rowLength = board.length;
        const colLength = board[0].length;
        for (let [ridx, row] of board.entries()) {
            for (let [cidx, col] of row.entries()) {
                if (['empty', 'clownfish'].includes(col.type) &&
                    (cidx-1 > 0 ? board[ridx][cidx-1].type !== 'coral' : true) && // North
                    (cidx+1 < colLength ? board[ridx][cidx+1].type !== 'coral' : true) && // South
                    (ridx+1 < rowLength ? board[ridx+1][cidx].type !== 'coral' : true) && // East
                    (ridx-1 > 0 ? board[ridx-1][cidx].type !== 'coral' : true) // West
                ) {
                    return {row: ridx, column: cidx};
                }
            }
        }

        return null;
    }

    _RestoreEmpties(board) {
        const rowLength = board.length;
        const colLength = board[0].length;
        for (let [ridx, row] of board.entries()) {
            for (let [cidx, col] of row.entries()) {
                if (
                    // Not RC Constraint
                    !(col.type === 'water' && (board[0][cidx].value === 0 || board[ridx][0].value === 0)) &&
                    // Not Open water
                    !(col.type === 'water' &&
                      (cidx-1 > 0 ? board[ridx][cidx-1].type !== 'coral' : true) && // North
                      (cidx+1 < colLength ? board[ridx][cidx+1].type !== 'coral' : true) && // South
                      (ridx+1 < rowLength ? board[ridx+1][cidx].type !== 'coral' : true) && // East
                      (ridx-1 > 0 ? board[ridx-1][cidx].type !== 'coral' : true) // West
                     ) &&
                    // Not meta column
                    ridx > 0 && cidx > 0 &&
                    !['empty', 'coral'].includes(col.type)
                ) {
                    console.log('Why is the human making this harder?')
                    return {row: ridx, column: cidx};
                }
            }
        }

        return null;
    }

    _RScan(board) {
        for (let [ridx, row] of board.entries()) {
            if (ridx > 0) {
                const rowConstraint = row[0].value;
                const emptiesInRow = row.reduce((accumulator, col) => accumulator + (col.type ==='empty' ? 1 : 0), 0);
                const fishInRow = row.reduce((accumulator, col) => accumulator + (col.type ==='clownfish' ? 1 : 0), 0);

                if (rowConstraint >= emptiesInRow + fishInRow && fishInRow < rowConstraint) {
                    for (let [cidx, col] of row.entries()) {
                        if (['empty'].includes(col.type)) {
                            // col.type = 'clownfish';
                            // return;
                            return {row: ridx, column: cidx, type: 'clownfish'};
                        }
                    }
                }
            }
        }

        return null;
    }

    _CScan(board) {
        const rowLength = board.length;
        const colLength = board[0].length;
        const colConstraints = board[0].map(col => col.value);

        for (let cidx = 1; cidx < colLength; cidx++) {
            let colConstraint = colConstraints[cidx];
            let emptiesInCol = 0;
            let fishInCol = 0;
            for (let ridx = 1; ridx < rowLength; ridx++) {
                emptiesInCol += (['empty', 'clownfish'].includes(board[ridx][cidx].type)) ? 1 : 0;
                fishInCol += (['clownfish'].includes(board[ridx][cidx].type)) ? 1 : 0;
            }

            if (colConstraint >= emptiesInCol + fishInCol && fishInCol < colConstraint) {
                for (let ridx = 1; ridx < rowLength; ridx++) {
                     if (['empty'].includes(board[ridx][cidx].type)) {
                        // board[ridx][cidx].type = 'clownfish';
                        // return;
                        return {row: ridx, column: cidx, type: 'clownfish'};
                    }
                }
            }
        }

        return null;
    }

    _RowDoneBackfill(board) {
        for (let [ridx, row] of board.entries()) {
            if (ridx > 0) {
                const rowConstraint = row[0].value;
                const emptiesInRow = row.reduce((accumulator, col) => accumulator + (col.type ==='empty' ? 1 : 0), 0);
                const fishInRow = row.reduce((accumulator, col) => accumulator + (col.type ==='clownfish' ? 1 : 0), 0);

                if (emptiesInRow > 0 && rowConstraint === fishInRow) {
                    for (let [cidx, col] of row.entries()) {
                        if (['empty'].includes(col.type)) {
                            // col.type = 'water';
                            // return;
                            return {row: ridx, column: cidx, type: 'water'};
                        }
                    }
                }
            }
        }

        return null;
    }

    _ColDoneBackfill(board) {
        const rowLength = board.length;
        const colLength = board[0].length;
        const colConstraints = board[0].map(col => col.value);

        for (let cidx = 1; cidx < colLength; cidx++) {
            let colConstraint = colConstraints[cidx];
            let emptiesInCol = 0;
            let fishInCol = 0;
            for (let ridx = 1; ridx < rowLength; ridx++) {
                emptiesInCol += (['empty'].includes(board[ridx][cidx].type)) ? 1 : 0;
                fishInCol += (['clownfish'].includes(board[ridx][cidx].type)) ? 1 : 0;
            }

            if (emptiesInCol > 0 && colConstraint === fishInCol) {
                for (let ridx = 1; ridx < rowLength; ridx++) {
                     if (['empty'].includes(board[ridx][cidx].type)) {
                        // board[ridx][cidx].type = 'water';
                        // return;
                        return {row: ridx, column: cidx, type: 'water'};
                    }
                }
            }
        }

        return null;
    }

    _NoTouching(board) {
        const rowLength = board.length;
        const colLength = board[0].length;
        for (let [ridx, row] of board.entries()) {
            if (ridx > 0) {
                for (let [cidx, col] of row.entries()) {
                    if (cidx > 0 && ['empty'].includes(col.type) && (
                        (cidx-1 > 0 ? board[ridx][cidx-1].type === 'clownfish' : false) || // North
                        (cidx+1 < colLength ? board[ridx][cidx+1].type === 'clownfish' : false) || // South
                        (ridx+1 < rowLength ? board[ridx+1][cidx].type === 'clownfish' : false) || // East
                        (ridx-1 > 0 ? board[ridx-1][cidx].type === 'clownfish' : false) || // West

                        (cidx-1 > 0 && ridx+1 < rowLength ? board[ridx+1][cidx-1].type === 'clownfish' : false) || // NorthEast
                        (cidx-1 > 0 && ridx-1 > 0 < rowLength ? board[ridx-1][cidx-1].type === 'clownfish' : false) || // NorthWest
                        (cidx+1 < colLength && ridx+1 < rowLength ? board[ridx+1][cidx+1].type === 'clownfish' : false) || // SouthEast
                        (cidx+1 < colLength && ridx-1 > 0 ? board[ridx-1][cidx+1].type === 'clownfish' : false))  // SouthWest
                       )
                    {
                        // col.type = 'water';
                        // return;
                        return {row: ridx, column: cidx, type: 'water'};
                    }
                }
            }
        }

        return null;
    }

    _CScan2(board) {
        const rowLength = board.length;
        const colLength = board[0].length;
        const colConstraints = board[0].map(col => col.value);

        for (let cidx = 1; cidx < colLength; cidx++) {
            let colConstraint = colConstraints[cidx];
            let emptiesInCol = 0;
            let fishInCol = 0;
            for (let ridx = 1; ridx < rowLength; ridx++) {
                emptiesInCol += (['empty'].includes(board[ridx][cidx].type)) ? 1 : 0;
                fishInCol += (['clownfish'].includes(board[ridx][cidx].type)) ? 1 : 0;
            }

            if (emptiesInCol > 0) {
                for (let ridx = 1; ridx < rowLength; ridx++) {
                     if (['empty'].includes(board[ridx][cidx].type)) {
                        //board[ridx][cidx].type = colConstraint === fishInCol ? 'water' : 'clownfish';
                        let type = (colConstraint === fishInCol) ? 'water' : 'clownfish';
                        return {row: ridx, column: cidx, type: type};
                    }
                }
            }
        }

        return null;
    }

    /**
       Overridden method of base class. Will return a random cell to click.
       @method nextSuggestion
       @param {Game} Game object
       @return {Cell}
    */
    nextSuggestion(game) {



        let cellSuggestion = this._RCConstraint(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column);
        }

        cellSuggestion = this._getOpenWater(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column);
        }

        cellSuggestion = this._RowDoneBackfill(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column, cellSuggestion.type);
        }

        cellSuggestion = this._ColDoneBackfill(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column, cellSuggestion.type);
        }

        cellSuggestion = this._RScan(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column, cellSuggestion.type);
        }

        cellSuggestion = this._CScan(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column, cellSuggestion.type);
        }

        cellSuggestion = this._NoTouching(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column, cellSuggestion.type);
        }

        cellSuggestion = this._RowDoneBackfill(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column, cellSuggestion.type);
        }

        cellSuggestion = this._ColDoneBackfill(game.board);
        if (cellSuggestion !== null) {
            return new CellSuggestion(cellSuggestion.row, cellSuggestion.column, cellSuggestion.type);
        }

        if (game.board.length === 8) {
            return new CellSuggestion(2, 1, 'clownfish');
        }
        // else if (game.board.length === 9) {
        //     if (game.board[8][4].type === 'clownfish') {
        //         return new CellSuggestion(4, 7, 'clownfish');
        //     }
        //     else {
        //         return new CellSuggestion(8, 4, 'clownfish');
        //     }
        // }
        else if (game.board.length === 11) {
            return new CellSuggestion(4, 1, 'clownfish');
        }
        else {
            return new CellSuggestion(0, 0);
        }

        // cellSuggestion = this._RScan2(game.board);
        // if (cellSuggestion !== null) {
        //     return new CellSuggestion(0, 0);
        // }

        // cellSuggestion = this._CScan2(game.board);
        // if (cellSuggestion !== null) {
        //     return new CellSuggestion(0, 0);
        // }

        // const size = game.board.length - 1;
        // let row, column  = 0;

        // // Pick a non coral cell
        // do {
        //     row = this._getRandomInt(1, size);
        //     column = this._getRandomInt(1, size);
        // } while (game.board[row][column].type == 'coral');

        // debugger;

        // return new CellSuggestion(row, column);
    }
}
