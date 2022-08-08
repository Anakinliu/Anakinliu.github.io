const localMineCount = localStorage.getItem('userMine') ? parseInt(localStorage.getItem('userMine')) : 10;
const localSeed = localStorage.getItem('userSeed') ? parseInt(localStorage.getItem('userSeed')) : 10;
const localRow = localStorage.getItem('userRow') ? parseInt(localStorage.getItem('userRow')) : 18;
const localCol = localStorage.getItem('userCol') ? parseInt(localStorage.getItem('userCol')) : 24;
const sounds = {
    'click': new Howl({
        src: ['./audio/click.wav']
    }),
    'flag': new Howl({
        src: ['./audio/flag.wav']
    }),
    'exp': new Howl({
        src: ['./audio/explosion.wav']
    }),
    'win': new Howl({
        src: ['./audio/win.wav']
    }),
    'denied': new Howl({
        src: ['./audio/denied.wav']
    }),
}
function play(k) {
    sounds[k].play();
}

function bfs(arr1, arr2, arr3, count, r, c, rLim, cLim) {// 0区域向外扩展，直到遇到标号区域
    // arr1: 标号数组， arr2：可见性数组,arr3: flag数组
    // 返回:揭开的cell中被插上flag的个数
    if (true === arr2[r][c]) {  // 递归结束条件：访问过的正好用到arr2标记，避免无限循环调用访问造成栈溢出
        return count;
    }
    if (0 < arr1[r][c]) {  // 标号 大于0 cell
        arr2[r][c] = true;
        if (true === arr3[r][c]) {
            arr3[r][c] = false;
            count += 1;
        }
        return count;
    }
    if (arr1[r][c] === 0) {  // 标号 0 cell
        if (true === arr3[r][c]) {
            arr3[r][c] = false;
            count += 1;
        }
        arr2[r][c] = true;
    }
    if (c + 1 < cLim) {  // 右
        count = bfs(arr1, arr2, arr3, count, r, c + 1, rLim, cLim);
    }
    if (c - 1 >= 0) {  // 左
        count = bfs(arr1, arr2, arr3, count, r, c - 1, rLim, cLim);
    }
    if (r + 1 < rLim) {  // 下
        count = bfs(arr1, arr2, arr3, count, r + 1, c, rLim, cLim);
    }
    if (r - 1 >= 0) {  // 上
        count = bfs(arr1, arr2, arr3, count, r - 1, c, rLim, cLim);
    }
    return count;
}
const app = Vue.createApp({
    data() {
        return {
            row: localRow,
            col: localCol,
            boardArr: [], // ele: 0-8标号表示周围8个区域雷数;NaN代表雷
            mineCount: localMineCount,
            flagCount: 0,
            isFirstStep: true,  // 是否第一次揭开
            isGameOver: false,
            visibleArr: [],  // ele: true 揭开 ； false 没揭开
            flagArr: [],  // ele:  true 已插旗；false 没插旗
            isSuccess: false,
            seed: localSeed,
            nearbyObj: {}, // 双击以解开的数字cell时，此obj存放周围没有揭开的cell
        }
    },
    mounted() {
        this.restartGame();
        console.log('created...');
    },
    watch: {
        row(v, oldV) {
            if (v < 1 || v * this.col <= this.mineCount) {
                this.row = oldV;
                return;
            }
            localStorage.setItem('userRow', v);
            this.restartGame();
        },
        col(v, oldV) {
            if (v < 1 || v * this.row <= this.mineCount) {
                this.col = oldV;
                return;
            }
            localStorage.setItem('userCol', v);
            this.restartGame();
        },
        mineCount(v, oldV) {
            if (v >= this.col * this.row || v < 0) {
                this.mineCount = oldV;
                return
            }
            localStorage.setItem('userMine', v);
            this.restartGame();
        },
        seed(v) {
            localStorage.setItem('userSeed', v);
            this.restartGame();
        },
        flagCount(v, oldV) {
            this.checkSuccess();
        },
        visibleArr: {  // 监听较复杂数据结构比较特殊
            handler(v, oldV) {
                // 因为最后一步可能不是插旗，所以需要监听这个数组
                // console.log('watch visible Arr');
                this.checkSuccess();
            },
            deep: true
        }
    },
    methods: {
        dblCheck(r, c) {
            this.nearbyObj = {}; // 清空obj

            function fillNearByObj(arr1, arr2, arr3, obj1, row, col) {
                // arr1:boardArr ; arr2:flagArr ;arr3: visibleArr; obj1: nearByObj
                if (false === arr3[row][col] && false === arr2[row][col]) {  // 存放周围的没有揭开的 并且 没插旗 的cell的坐标，key是row，value是数组，存放col
                    if (undefined === obj1[row]) {
                        obj1[row] = [col];
                    } else {
                        obj1[row].push(col);
                    }
                }
                if (0 <= arr1[row][col] && true === arr2[row][col]) {// 不是雷区但是已插旗
                    return false;  // 
                }
                if (isNaN(arr1[row][col]) && false === arr2[row][col]) {//是雷区但是没插旗
                    return false;
                }
                
                return true;  // 
            }

            if (true === this.visibleArr[r][c] && 0 < this.boardArr[r][c]) {// 双击已经揭开的数字cell才有响应
                const allCellStat = [];  // 数组内全是true时，代表周围的cell全部符合条件，可以揭开
                if (c + 1 < this.col) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r, c + 1))
                }
                if (c - 1 >= 0) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r, c - 1))
                }
                if (r + 1 < this.row) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r + 1, c))
                }
                if (r - 1 >= 0) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r - 1, c))
                }
                if (c + 1 < this.col && r + 1 < this.row) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r + 1, c + 1))
                }
                if (c + 1 < this.col && r - 1 >= 0) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r - 1, c + 1))
                }
                if (c - 1 >= 0 && r + 1 < this.row) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r + 1, c - 1))
                }
                if (c - 1 >= 0 && r - 1 >= 0) {
                    allCellStat.push(fillNearByObj(this.boardArr, this.flagArr, this.visibleArr, this.nearbyObj, r - 1, c - 1))
                }
                console.log('see: ', allCellStat, this.nearbyObj);
                if (0 === Object.keys(this.nearbyObj).length) {
                    // 周围全部揭开
                    play('denied');
                } else if (allCellStat.every(e => e === true)) {
                    play('click');
                    // play('denied');
                    for (let nearRow in this.nearbyObj) {
                        for (let nearCol of this.nearbyObj[nearRow]) {
                            console.log(nearRow, nearCol);
                            this.checkCell(nearRow, nearCol);
                        }
                    }
                    
                } else {
                    play('denied');
                }

            }
        },
        restartGame() {
            console.log('restart');
            this.boardArr = Array(this.row).fill(0).map(e => Array(this.col).fill(0));
            this.visibleArr = Array(this.row).fill(false).map(e => Array(this.col).fill(false));
            this.flagArr = Array(this.row).fill(false).map(e => Array(this.col).fill(false));
            this.flagCount = this.mineCount;
            this.isFirstStep = true;
            this.isSuccess = false;
            this.isGameOver = false;
            // this.seed = parseInt(Math.random() * 10000);
            console.log('restart DONE seed: ', this.seed);
        },
        checkSuccess() {
            if (this.flagCount === 0) {
                console.log('已用完所有FLAG');
                let i = 0, j = 0;
                for (; i < this.row; i++) {
                    for (j = 0; j < this.col; j++) {
                        if (this.visibleArr[i][j] === this.flagArr[i][j]) {
                            return // flag没有全部一一对应插到雷上
                        }
                    }
                }
                play('win');
                // alert('success');
                this.isGameOver = true;
                this.isSuccess = true;
            }
        },
        initCellClass(rIdx, cIdx) {
            // 初始化棋盘颜色
            return {
                'bg-1': (cIdx % 2 === 0 && rIdx % 2 === 0) || (cIdx % 2 === 1 && rIdx % 2 === 1),
                'bg-2': (cIdx % 2 === 0 && rIdx % 2 === 1) || (cIdx % 2 === 1 && rIdx % 2 === 0),
            }
        },
        placeFlag(rIdx, cIdx) {
            if (true === this.visibleArr[rIdx][cIdx] || (this.flagCount <= 0 && false === this.flagArr[rIdx][cIdx])) {
                return
            }
            play('flag');  //PLAY
            this.flagArr[rIdx][cIdx] = !this.flagArr[rIdx][cIdx];
            if (true === this.flagArr[rIdx][cIdx]) {
                this.flagCount -= 1;
            } else {
                this.flagCount += 1;
            }
        },
        checkCell(rIdx, cIdx) {
            if (true === this.flagArr[rIdx][cIdx] || true === this.visibleArr[rIdx][cIdx]) {
                return;
            }
            if (this.isFirstStep) { // 第一次点击时不能直接踩雷
                this.generateMine(rIdx, cIdx);
                this.generateAnswer();
                this.isFirstStep = false;
                // console.log('first click is done');
                this.flagCount += bfs(this.boardArr, this.visibleArr, this.flagArr, 0, rIdx, cIdx, this.row, this.col);
                play('click');  // PLAY
            } else {
                if (true === this.isGameOver) {
                    // alert('刷新重开！')
                    return;
                } else {
                    // 正常游戏流程的点击
                    if (false === isNaN(this.boardArr[rIdx][cIdx])) {// 非 雷 cell
                        play('click');
                        this.flagCount += bfs(this.boardArr, this.visibleArr, this.flagArr, 0, rIdx, cIdx, this.row, this.col);
                    } else { // 点中雷   
                        this.visibleArr[rIdx][cIdx] = true;
                        this.isGameOver = true;
                        play('exp');
                        // alert('你踩雷了！')
                        return;  // 游戏结束
                    }
                }
            }
        },
        generateMine(r, c) {
            const mineSet = new Set();
            const cellCount = this.row * this.col;
            const myRandom = new Math.seedrandom(this.seed);
            while (mineSet.size < this.mineCount) {
                let n = parseInt(myRandom() * cellCount);
                if (n !== r * this.col + c) {// NOTE：生成的雷不能是鼠标第一次点击的位置！即使seed不变
                    mineSet.add(n);
                }
            }
            for (let e of mineSet) {
                this.boardArr[parseInt(e / this.col)][e % this.col] = NaN;
            }
            // console.log(this.boardArr);
        },
        generateAnswer() {
            let r = 0;
            let c = 0;
            for (; r < this.row; r++) {
                for (c = 0; c < this.col; c++) {
                    if (isNaN(this.boardArr[r][c])) {
                        if (c + 1 < this.col) {
                            this.boardArr[r][c + 1] += 1;
                        }
                        if (c - 1 >= 0) {
                            this.boardArr[r][c - 1] += 1;
                        }
                        if (r + 1 < this.row) {
                            this.boardArr[r + 1][c] += 1;
                        }
                        if (r - 1 >= 0) {
                            this.boardArr[r - 1][c] += 1;
                        }
                        if (c + 1 < this.col && r + 1 < this.row) {
                            this.boardArr[r + 1][c + 1] += 1;
                        }
                        if (c + 1 < this.col && r - 1 >= 0) {
                            this.boardArr[r - 1][c + 1] += 1;
                        }
                        if (c - 1 >= 0 && r + 1 < this.row) {
                            this.boardArr[r + 1][c - 1] += 1;
                        }
                        if (c - 1 >= 0 && r - 1 >= 0) {
                            this.boardArr[r - 1][c - 1] += 1;
                        }
                    }
                }
            }
        }
    }
})

app.mount('#game');