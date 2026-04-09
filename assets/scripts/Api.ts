import {HTTP_URL} from "./env";

export enum SlotCode {
    S001='S001',

}
export enum Action {
    SPIN='SPIN',

}

export interface SlotReq {

    slotCode: SlotCode;

    player: string;

    action: Action;

    bet: number;
}


export interface SlotRes {
    cols: number;
    rows: number;
    valid: number;
    symbols: number[];
    lines: Entry<number[], number>[];
    frees: number[];
    multiples: number[];
    scatters: number[];
    jackpot: number;
    bet: number;
    win: number;
    freeCount: number;
    balance: number;
}

export interface Entry<K,V> {
    k: K;
    v: V;
}

export const play =  (req: SlotReq) => {
    return post(`${HTTP_URL}/game/slot/play`, 'POST', req);
}

// fetch-wrapper.ts
export async function post(url: string, method: HttpMethod='POST', body?: any) {
    const config: RequestConfig = {method, body};
    return httpFetch(url, config);
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
interface RequestConfig {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: any;
}
async function httpFetch<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    const { method = 'GET', headers = {}, body } = config;

    const finalHeaders = {
        'Content-Type': 'application/json',
        ...headers,
    };
    try {
        const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorText = await response.json();
            console.error('请求失败', errorText.detail);
            throw new Error(errorText.detail || `HTTP ${response.status}`);
        }

        return response.json();
    } catch(error) {
        return Promise.reject(error);
    }
}
