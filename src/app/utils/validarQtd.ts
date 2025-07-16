

export const ValidarCompostoCH = (c: number, h: number) => {
    
    const result = (2 * c) + 2;

    console.log(result);

    if(h == result){
        return true;
    }

    return false;
}