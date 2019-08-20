import React from 'react';
import Head from 'next/head';
import { Layout, DatePicker, Input, Row, Col, Progress, message } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const parse = require('mrz').parse;
import { Form, Icon, Button, Checkbox } from 'antd';

import { WrappedNormalLoginForm } from './WrappedNormalLoginForm';

import 'antd/dist/antd.css';
import './style.css';

export default class ProgressComponent extends React.Component {
    state = {
        image: '',
        mrzText: '',
        progress: 0,
        data: {
            documentCode: '',
            documentNumber: '',
            nationality: '',
            expirationDate: '',
            birthDate: '',
            firstName: '',
            lastName: '',
            personalNumber: '',
            sex: ''
        }
    };

    componentDidMount() {
        this.onChange();
    }

    onChange = () => {
        this.setState({
            data: {
                documentCode: '',
                documentNumber: '',
                nationality: '',
                expirationDate: '',
                birthDate: '',
                firstName: '',
                lastName: '',
                personalNumber: '',
                sex: ''
            }
        });
        var file = this.props.file;
        console.log(file);
        var reader = new FileReader();
        reader.onload = e => {
            console.log(e.target.result);
            this.setState({
                image: e.target.result
            });
        };
        reader.readAsDataURL(file);
        Tesseract.recognize(file, {
            lang: 'OCRB',
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<'
        })
            .progress(message => {
                console.log(message);
                if (message.status === 'recognizing text') {
                    this.setState({
                        progress: Math.round(message.progress * 100)
                    });
                }
            })
            .then(result => {
                // Select lines of length 44 starting with P>
                console.log(result.lines.map(line => line.text.trim().length));
                let selected = result.lines.filter(line => line.text.trim().replace(' ', '').length >= 44);
                if (selected.length > 2) {
                    selected = selected.slice(selected.length - 2, selected.length);
                }
                let mrz = selected
                    .map(line => {
                        let resultText = line.text
                            .split(' ')
                            .join('')
                            .trim();
                        console.log(resultText);
                        if (resultText.length > 44) {
                            return resultText.substring(0, 44);
                        }

                        if (resultText.length < 44) {
                            resultText = resultText + '<';
                            return resultText;
                        }

                        return resultText;
                    })
                    .join('\n')
                    .replace(/ /, '');
                console.log(mrz);

                this.setState(
                    {
                        mrzText: mrz
                    },
                    () => {
                        this.processMrz(mrz);
                    }
                );
            })
            .catch(function(err) {
                console.error(err);
            });
    };

    renderImage = () => {
        if (this.state.image !== '') {
            return <img id="document" src={this.state.image} style={{ width: '100%' }} />;
        } else {
            return (
                <img
                    id="document"
                    src={'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'}
                    style={{ width: '100%' }}
                />
            );
        }
    };

    processMrz = mrz => {
        try {
            const mrzParse = parse(mrz);
            const { fields } = mrzParse;
            const { documentCode, documentNumber, nationality, expirationDate, birthDate, firstName, lastName, personalNumber, sex } = fields;
            this.setState({
                data: {
                    documentCode,
                    documentNumber,
                    nationality,
                    expirationDate,
                    birthDate,
                    firstName,
                    lastName,
                    personalNumber,
                    sex
                }
            });
        } catch (error) {
            message.error('Đã có lỗi xảy ra');
        }
    };

    render() {
        return (
            <Row style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                <Col span={12} style={{ padding: 20 }}>
                    {this.renderImage()}
                </Col>
                <Col span={12} style={{ padding: 20 }}>
                    <div style={{ paddingTop: 80 }}>
                        <Progress percent={this.state.progress} status="active" />
                        <WrappedNormalLoginForm formData={this.state.data} />
                    </div>
                </Col>
            </Row>
        );
    }
}

const val = char => {
    switch (true) {
        case char == '<':
            return 0;
        case /[0-9]/.test(char):
            return char.charCodeAt(0) - 48;
        case /[A-Z]/.test(char):
            return char.charCodeAt(0) - 65 + 10;
        default:
            console.log("error parsing character '" + char + "'");
            return 0;
    }
};

const mrz_checksum = str => {
    str = str
        .toUpperCase()
        .replace(/\s*/, '')
        .replace(/(\r\n|\n|\r)/gm, '')
        .split('');
    values = str.map(val);
    return (
        values
            .map(function(v, i) {
                switch (i % 3) {
                    case 0:
                        return v * 7;
                    case 1:
                        return v * 3;
                    case 2:
                        return v;
                }
            })
            .reduce(function(pv, cv) {
                return pv + cv;
            }, 0) % 10
    );
};

const mrz2_check = mrz => {
    check1 = mrz[9] == mrz_checksum(mrz.substr(0, 9));
    check2 = mrz[19] == mrz_checksum(mrz.substr(13, 6));
    check3 = mrz[27] == mrz_checksum(mrz.substr(21, 6));
    check4 = mrz[42] == mrz_checksum(mrz.substr(28, 13));
    check5 = mrz[43] == mrz_checksum(mrz.substr(0, 10) + mrz.substr(13, 7) + mrz.substr(21, 22));
    return check1 && check2 && check3 && check4 && check5;
};
