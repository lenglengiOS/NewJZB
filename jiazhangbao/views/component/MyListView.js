/**
 * 公共的listview 组件
 * Created by jinwangtong on 16/3/28.
 */
/**
 * 资讯列表
 */
'use strict';
import commenStyle from '../styles/basestyle';
import Tools from '../tools';
import {navheight,screenWidth,screenHeight,navbackground,Size} from '../constStr'
import { Bubbles, DoubleBounce, Bars, Pulse } from 'react-native-loader';
import React from 'react';
import PageLoading from '../tools/Loading'
import {
    View,
    Text,
    ListView,
    Image,
    ScrollView,
    ActivityIndicatorIOS,
    ProgressBarAndroid,
    Platform,
    PixelRatio
} from 'react-native';
export default class MyListView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isRefreshing: false,
            loadingmore: true,
        }

    }

    componentDidMount() {
        this.setState({
            isRefreshing: false,
            loadingmore: true,
        })
    }
    scrollTo(obj){
        this.listview&&this.listview.scrollTo(obj)
    }
    componentWillReceiveProps(nextProps) {     
        this.setState({
            isRefreshing: false,
        })
    }
    renderFooter() {
        if (this.props.dataSize >= this.props.count) {
            return (
                <View style={commenStyle.listFooter}>
                    <Text style={{fontSize:Size(14)}}>{this.props.hideToast?"":"没有更多数据"}</Text>
                </View>
            )
        } else if (this.props.loadMore) {
            return (
                <View style={[commenStyle.listFooter,{flexDirection:"row"}]}>
                    <Bubbles size={Size(8)} color="#ff7836" />          
                </View>
            )
        }    
    }

    render() {
        if(this.props.dataSize<=0||this.props.count<=0){
            return(
                <ScrollView style={commenStyle.container} scrollTop={this.props.scrollTop} 
                    refreshControl={Tools.intiRefresh(this.state.isRefreshing,this._onRefresh.bind(this))}>
                    <Text style={{textAlign:"center",fontSize:Size(14),marginTop:10}}>{this.props.hideToast?"":"暂无数据"}</Text>
                </ScrollView>
                )
        }
        return (
            <View style={commenStyle.container}>
                <ListView
                    ref={(o)=>this.listview=o}
                    renderHeader={this.props.renderHeader?this.props.renderHeader:null}
                    refreshControl={
                    Tools.intiRefresh(this.state.isRefreshing,this._onRefresh.bind(this))}
                    dataSource={this.props.dataSource}
                    renderRow={this.props.renderRow}
                    contentContainerStyle={[this.props.style]}
                    onEndReachedThreshold={10}
                    enableEmptySections = {true}
                    initialListSize={this.props.dataSize}
                    onEndReached={this.loadMore.bind(this)}
                    scrollTop={this.props.scrollTop}
                    renderFooter={this.renderFooter.bind(this)}/>
            </View>
        )
    }

    _onRefresh() {
        if(this.props.onRefresh){
            this.setState({
                isRefreshing:true,
            });
            this.props.onRefresh();
            this.props.scrollTop&&this.props.scrollTop()
        }
    }

    /**
     * 加载更多
     */
    loadMore() {
        if(this.props.loadMore){
            if (this.props.dataSize < this.props.count) {
                this.props.loadMore()
            }
        }
    }
}
;