export default function Stack() {
    this.dataStore = [];//保存栈内元素，初始化为一个空数组
    this.top = 0;//栈顶位置，初始化为0
    this.push = push;//入栈
    this.pop = pop;//出栈
    this.peek = peek;//查看栈顶元素
    this.clear = clear;//清空栈
    this.length = length;//栈内存放元素的个数
}

function push(element){
    this.dataStore[this.top++] = element;
}

function pop(){
    return this.dataStore[--this.top];
}

function peek(){
    return this.dataStore[this.top-1];
}

function clear(){
    delete this.dataStore;
    this.dataStore = [];
    this.top = 0;
}

function length(){
    return this.top;
}