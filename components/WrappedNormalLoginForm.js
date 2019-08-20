import React from 'react';
import Head from 'next/head';
import { Layout, DatePicker, Input, Row, Col, Progress, message } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const parse = require('mrz').parse;
import { Form, Icon, Button, Checkbox } from 'antd';
const processString = str => {
    try {
        if (str === '') {
            return '';
        }
        const splited = str.split('');
        return `${splited[4]}${splited[5]}/${splited[2]}${splited[3]}/20${splited[0]}${splited[1]}`;
    } catch (error) {
        message.error('Đã có lỗi xảy ra');
    }
};

const processDate = str => {
    try {
        if (str === '') {
            return '';
        }
        const splited = str.split('');

        let year = 19;

        if (parseInt(splited[0] + splited[1]) > 19) {
            year = 19;
        } else {
            year = 20;
        }

        return `${splited[4]}${splited[5]}/${splited[2]}${splited[3]}/${year}${splited[0]}${splited[1]}`;
    } catch (error) {
        message.error('Đã có lỗi xảy ra');
    }
};
class NormalLoginForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        const { setFieldsValue, getFieldValue } = this.props.form;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let url = 'https://script.google.com/macros/s/AKfycbyvRrhcxUiDAFX-M07bJCIbSwe8Vw_LjhYpT0olUI6ZygFRwUg/exec?';
                url += `passportNumber=${getFieldValue('passportNo')}&`;
                url += `dateOfExpiry=${getFieldValue('dateOfExpiry')}&`;
                url += `nationality=${getFieldValue('nationality')}&`;
                url += `fullname=${getFieldValue('fullname')}&`;
                url += `dateOfBirth=${getFieldValue('dateOfBirth')}&`;
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
                dateOfBirth: processDate(formData.birthDate),
                fullname: formData.lastName + ' ' + formData.firstName,
                idNumber: formData.personalNumber,
                sex: formData.sex === 'male' ? 'M' : 'F'
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
                        <Form.Item label="Họ">
                            {getFieldDecorator('fullname', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Họ và tên" />)}
                        </Form.Item>
                        <Form.Item label="Giới tính">
                            {getFieldDecorator('sex', {
                                rules: [{ required: true, message: 'Please input your Password!' }]
                            })(<Input placeholder="Giới tính" />)}
                        </Form.Item>
                        <Form.Item label="Quốc gia">
                            {getFieldDecorator('nationality', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Quốc gia" />)}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Ngày sinh">
                            {getFieldDecorator('dateOfBirth', {
                                rules: [{ required: true, message: 'Please input' }]
                            })(<Input placeholder="Ngày sinh" />)}
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
export const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);
