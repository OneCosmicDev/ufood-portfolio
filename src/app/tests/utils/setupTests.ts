import '@testing-library/jest-dom';
import {TextDecoder, TextEncoder} from 'util';
import axios, {AxiosHeaderValue, AxiosInstance} from "axios";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }),
});

class FakeXMLHttpRequest {
    public readyState: number = 0;
    public status: number = 0;
    public responseText: string = '';
    public onreadystatechange: (() => void) | null = null;
    public onload: (() => void) | null = null;
    public onerror: ((err: any) => void) | null = null;

    open(_method: string, _url: string) {}

    setRequestHeader(_name: string, _value: string) {}

    getResponseHeader(_name: string) {
        return null;
    }

    abort() {}

    send() {
        setTimeout(() => {
            this.readyState = 4;
            this.status = 200;
            this.responseText = '{}';
            if (typeof this.onreadystatechange === 'function') {
                try {
                    this.onreadystatechange();
                } catch {}
            }
            if (typeof this.onload === 'function') {
                try {
                    this.onload();
                } catch {}
            }
        }, 0);
    }
}

(window as any).XMLHttpRequest = FakeXMLHttpRequest as any;

jest.mock("axios");
export const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.create.mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
        request: {use: jest.fn(), eject: jest.fn(), clear: jest.fn()},
        response: {use: jest.fn(), eject: jest.fn(), clear: jest.fn()},
    },
    create: jest.fn(),
    defaults: {
        headers: {
            common: {} as Record<string, AxiosHeaderValue>,
            get: {} as Record<string, AxiosHeaderValue>,
            post: {} as Record<string, AxiosHeaderValue>,
            put: {} as Record<string, AxiosHeaderValue>,
            delete: {} as Record<string, AxiosHeaderValue>,
            head: {} as Record<string, AxiosHeaderValue>,
            patch: {} as Record<string, AxiosHeaderValue>,
        },
    },
    getUri: jest.fn(),
    request: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    patch: jest.fn(),
    postForm: jest.fn(),
    putForm: jest.fn(),
    patchForm: jest.fn(),
} as unknown as AxiosInstance);
