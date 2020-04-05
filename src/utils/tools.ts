import { notification } from 'antd';

export function notify(message: string, des='') {
    notification.error({
        message,
        description: des || message,
    });
}