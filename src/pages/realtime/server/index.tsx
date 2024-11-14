import { healthApi } from '@/api/request';
import { theme } from 'antd';
import React, { useEffect, useState } from 'react';
import HouyiServer from './houyi_server';
import './index.scss';
import RabbimtServer from './rabbit_server';

export interface LoginProps { }
const { useToken } = theme

let timer: NodeJS.Timeout | null = null
const Login: React.FC<LoginProps> = () => {
    const { token } = useToken()
    const [version, setVersion] = useState('version')

    const getVersion = () => {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            healthApi().then((res) => {
                setVersion(res.version)
            })
        }, 300)
    }
    useEffect(() => {
        getVersion()
    }, [])
    return (
        <div className='' style={{ padding: '20px' }}>
            <HouyiServer></HouyiServer>
            <RabbimtServer></RabbimtServer>
        </div>
    )
}

export default Login
