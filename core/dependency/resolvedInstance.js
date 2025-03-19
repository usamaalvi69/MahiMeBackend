module.exports = class ResolvedInstance
{
    constructor(arr) {
        this.classes = arr
    }

    get(name) {
        for(let key in this.classes)
        {
            if(key == name)
            {
                return this.classes[key];
            }
        }    
    }
}