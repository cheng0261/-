// 数据过滤
import type { DataItem } from '@/types'

export interface FilterValues {
    status: string
    channel: string
    owner: string
    keyword: string
}

export default function handleData (filterValue: FilterValues , data: DataItem[]): DataItem[] {
    const filterData = data.filter(item => {
        if (filterValue.status !== '全部' && item.status !== filterValue.status) {
            return false;
        }
        if (filterValue.channel !== '全部' && item.channel !== filterValue.channel) {
            return false;
        }
        if (filterValue.owner !== '全部' && item.owner !== filterValue.owner) {
            return false;
        }

        if (filterValue.keyword) {
            const keyword = String(filterValue.keyword).toLowerCase();
            return item.name?.toLowerCase().includes(keyword) ||
                   item.company?.includes(keyword) ||
                   item.phone?.includes(keyword);
        }

        return true;
    });

    return filterData;
}
