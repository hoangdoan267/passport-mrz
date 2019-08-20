import React from 'react';
import Head from 'next/head';
import { Layout, DatePicker, Input, Row, Col, Progress, message } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
const parse = require('mrz').parse;
import { Form, Icon, Button, Checkbox } from 'antd';

import 'antd/dist/antd.css';
import './style.css';
import ProgressComponent from '../components/ProgessComponent';
class Index extends React.Component {
    state = {
        files: []
    };

    componentDidMount() {
        window.Tesseract = Tesseract.create({
            langPath: 'https://exteris.github.io/tesseract-mrz/lang/'
        });
    }

    onChange = event => {
        try {
            const foo = [];

            var i = 0;

            while (i < fl) {
                var file = files[i];
                alert(file.name);
                i++;
            }

            var input = event.target;
            var files = input.files;
            var fl = files.length;

            while (i < fl) {
                // localize file var in the loop
                var file = files[i];
                foo.push(file);
                i++;
            }
            this.setState(
                {
                    files: []
                },
                () => {
                    this.setState({
                        files: foo
                    });
                }
            );
        } catch (error) {}
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
                                        multiple
                                        onChange={this.onChange}
                                        style={{ padding: 10 }}
                                    />
                                </div>
                            </Col>
                        </Row>
                        {this.state.files.map(el => {
                            return <ProgressComponent file={el} />;
                        })}
                    </Content>
                </Layout>
            </div>
        );
    }
}

export default Index;
