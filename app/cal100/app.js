
const app = Vue.createApp({
    data() {
        return {
            problems: [],
            answers: [],
            numOfP: 10,
            minNum: 10,
            maxNum: 99,
            seed: 1,
            isSingleColumn: true
        }
    },
    methods: {
        generateProblems() {
            const myRandom = new Math.seedrandom(this.seed);

            function getRandomInt(max) {
                // 到不了100，[0,99]
                return Math.floor(myRandom() * max);
            }
            const tp = [];
            const ta = [];
            while (tp.length < this.numOfP) {
                let a = getRandomInt(this.maxNum - this.minNum + 1) + this.minNum;
                let b = getRandomInt(this.maxNum - this.minNum + 1) + this.minNum;
                let c = getRandomInt(this.maxNum - this.minNum + 1) + this.minNum;
                // op === 0: +
                // op === 1: -
                let op1 = getRandomInt(2);
                let op2 = getRandomInt(2);
                // a op1 b 的结果
                let res1 = 0;
                // a op1 b op2 c 的结果
                let res2 = 0;
                let resStr = '';
                if (op1 === 0) {
                    res1 = a + b;
                    resStr = a + ' + ' + b
                } else {
                    res1 = a - b;
                    resStr = a + ' - ' + b
                }
                if (res1 <= 100 && res1 >= 0) {
                    if (op2 === 0) {
                        res2 = res1 + c;
                        resStr = resStr + ' + ' + c;
                    } else {
                        res2 = res1 - c;
                        resStr = resStr + ' - ' + c;
                    }
                    if (res2 <= 100 && res2 >= 0) {
                        tp.push(resStr + ' = ???');
                        ta.push(resStr + ' = ' + res2);
                    }
                }
            }
            this.problems = tp;
            this.answers = ta;
        },
        changeColumn() {
            this.isSingleColumn = !this.isSingleColumn;
        },
        showAnswers() {
            this.problems = this.answers;
        }
    }
})
app.mount('#assignment')