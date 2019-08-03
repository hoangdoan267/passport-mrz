import React from 'react';
import Head from 'next/head';
import { Layout, DatePicker, Input, Row, Col, Progress } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const parse = require('mrz').parse;
import { Form, Icon, Button, Checkbox } from 'antd';

import 'antd/dist/antd.css';
import './style.css';

const reverseString = str => {
    return str
        .split('')
        .reverse()
        .join('');
};

const processString = str => {
    if (str === '') {
        return '';
    }
    const splited = str.split('');
    return `${splited[4]}${splited[5]}/${splited[2]}${splited[3]}/${splited[0]}${splited[1]}`;
};
class NormalLoginForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        const { setFieldsValue, getFieldValue } = this.props.form;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let url = 'https://script.google.com/macros/s/AKfycbyvRrhcxUiDAFX-M07bJCIbSwe8Vw_LjhYpT0olUI6ZygFRwUg/exec?';
                url += `passportType=${getFieldValue('passportType')}&`;
                url += `passportNumber=${getFieldValue('passportNo')}&`;
                url += `dateOfExpiry=${getFieldValue('dateOfExpiry')}&`;
                url += `nationality=${getFieldValue('nationality')}&`;
                url += `lastname=${getFieldValue('lastname')}&`;
                url += `firstname=${getFieldValue('fullname')}&`;
                url += `dateOfBirth=${getFieldValue('dateOfBirth')}&`;
                url += `idNumber=${getFieldValue('idNumber')}&`;
                url += `sex=${getFieldValue('sex')}`;

                fetch(url)
                    .then(res => {
                        console.log('Done');
                    })
                    .catch(err => console.log(err));
            }
        });
    };

    static getDerivedStateFromProps = (props, state) => {
        const { formData } = props;
        const { setFieldsValue, getFieldValue } = props.form;
        if (formData.nationality !== getFieldValue('nationality')) {
            setFieldsValue({
                nationality: formData.nationality,
                passportType: formData.documentCode,
                passportNo: formData.documentNumber,
                dateOfExpiry: processString(formData.expirationDate),
                dateOfBirth: processString(formData.birthDate),
                fullname: formData.firstName,
                lastname: formData.lastName,
                idNumber: formData.personalNumber,
                sex: formData.sex
            });
        }
        return {
            ...state
        };
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">
                <Row gutter={8}>
                    <Col span={12}>
                        <Form.Item label="Loại hộ chiếu">
                            {getFieldDecorator('passportType', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Loại hộ chiếu" />)}
                        </Form.Item>
                        <Form.Item label="Quốc gia">
                            {getFieldDecorator('nationality', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Quốc gia" />)}
                        </Form.Item>
                        <Form.Item label="Số hộ chiếu">
                            {getFieldDecorator('passportNo', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Số hộ chiếu" />)}
                        </Form.Item>
                        <Form.Item label="Ngày hết hạn">
                            {getFieldDecorator('dateOfExpiry', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Ngày hết hạn" />)}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Họ">
                            {getFieldDecorator('lastname', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Họ" />)}
                        </Form.Item>
                        <Form.Item label="Tên đệm và tên">
                            {getFieldDecorator('fullname', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Tên đệm và tên" />)}
                        </Form.Item>
                        <Form.Item label="Ngày sinh">
                            {getFieldDecorator('dateOfBirth', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Ngày sinh" />)}
                        </Form.Item>
                        <Form.Item label="Giới tính">
                            {getFieldDecorator('sex', {
                                rules: [{ required: true, message: 'Please input your Password!' }]
                            })(<Input placeholder="Giới tính" />)}
                        </Form.Item>
                        <Form.Item label="Số căn cước">
                            {getFieldDecorator('idNumber', {
                                rules: [{ required: true, message: 'Please input your Password!' }]
                            })(<Input placeholder="Số căn cước" />)}
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Gửi
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}
const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);

class Index extends React.Component {
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
        window.Tesseract = Tesseract.create({
            langPath: 'https://exteris.github.io/tesseract-mrz/lang/'
        });
    }

    onChange = event => {
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
        var input = event.target;
        var file = input.files[0];
        console.log(file);
        var reader = new FileReader();
        reader.onload = e => {
            this.setState({
                image: e.target.result
            });
        };
        reader.readAsDataURL(input.files[0]);
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
            console.log(error);
        }
    };

    render() {
        return (
            <div>
                <Head>
                    <title>My page title</title>
                    <script src="https://cdn.rawgit.com/naptha/tesseract.js/1.0.10/dist/tesseract.js" />
                </Head>
                <Layout>
                    <Header />
                    <Content>
                        <Row style={{ paddingLeft: '30px', paddingRight: '30px' }}>
                            <Col span={12} style={{ padding: 20 }}>
                                <div style={{ margin: '30px' }}>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        name="fileInput"
                                        accept="image/*"
                                        onChange={this.onChange}
                                        style={{ padding: 10 }}
                                    />
                                </div>
                                {this.renderImage()}
                            </Col>
                            <Col span={12} style={{ padding: 20 }}>
                                <div style={{ paddingTop: 80 }}>
                                    <Progress percent={this.state.progress} status="active" />
                                    <WrappedNormalLoginForm formData={this.state.data} />
                                </div>
                            </Col>
                            {/* <Col span={12}>col-12</Col> */}
                        </Row>
                    </Content>
                </Layout>
            </div>
        );
    }
}

export default Index;

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
