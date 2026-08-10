class MemoryEngine {
    constructor() { this.memories = []; }
    addMemory(content) { this.memories.push(content); if(this.memories.length > 10) this.memories.shift(); }
    getMemories() { return this.memories; }
}
module.exports = MemoryEngine;
