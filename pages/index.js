import React from 'react';
import Document, { Head, Main, NextScript } from 'next/document';
import { Layout, DatePicker, Input, Row, Col } from 'antd';
import Tesseract from 'tesseract.js';
const { Header, Footer, Sider, Content } = Layout;
const path = require('path');

import 'antd/dist/antd.css';
Tesseract.create({
    langPath: 'https://exteris.github.io/tesseract-mrz/lang/'
});
class Index extends React.Component {
    state = {
        image: ''
    };

    componentDidMount() {
        Tesseract.create({
            langPath: 'https://exteris.github.io/tesseract-mrz/lang/'
        });
    }

    onChange = event => {
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
            .progress(function(message) {
                console.log(message);
            })
            .then(function(result) {
                var contentArea = document.getElementById('document-content');
                // Select lines of length 44 starting with P>
                console.log(result.lines.map(line => line.text.trim().length));
                selected = result.lines.filter(line => line.text.trim().length >= 44);
                if (selected.length > 2) {
                    selected = selected.slice(selected.length - 2, selected.length);
                }
                mrz = selected
                    .map(line => {
                        return line.text.substring(0, 43);
                    })
                    .join('\n')
                    .replace(/ /, '');
                contentArea.innerText = mrz;
                console.log(mrz);

                // calculate the checksum
                correct = mrz2_check(selected[1].text);

                var checkArea = document.getElementById('document-check');
                checkArea.innerText = 'Checksum: ' + correct;
            })
            .catch(function(err) {
                console.error(err);
            });
    };

    renderImage = () => {
        if (this.state.image !== '') {
            return <img id="document" src={this.state.image} style={{ width: '500px' }} />;
        } else {
            return (
                <img
                    id="document"
                    src={'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'}
                    style={{ width: '500px' }}
                />
            );
        }
    };

    render() {
        return (
            <div>
                <Layout>
                    <Header />
                    <Content>
                        <Row>
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
                            {/* <Col span={12}>col-12</Col> */}
                        </Row>
                    </Content>

                    <Footer>Footer</Footer>
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
