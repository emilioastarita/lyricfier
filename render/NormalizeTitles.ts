
export class NormalizeTitles {
    
    public normalize(str: string) {
        const parts = str.split('-');
        if (parts.length === 2 && this.isDroppable(parts[1])) {
            return parts[0].trim();
        }
        return str;
    }

    protected isDroppable(str: string) {
        return this.isRemastered(str) ||
                this.isBonusTrack(str) ||
                this.isLive(str);
    }

    protected isRemastered(str : string) {
        return str.toLocaleLowerCase().indexOf('remastered') > - 1;
    }

    protected isBonusTrack(str : string) {
        return str.toLocaleLowerCase().indexOf('bonus track') > - 1;
    }

    protected isLive(str : string) {
        return str.toLocaleLowerCase().indexOf('live') > - 1;
    }

}
