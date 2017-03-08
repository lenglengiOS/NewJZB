'use strict';

let {
  StyleSheet,
  PixelRatio
} = require('react-native');
import {Size,navheight} from '../../constStr'
module.exports = StyleSheet.create({
   container: {
      flex: 1,
      position: 'absolute',
      top:navheight,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:"transparent"
   },

   loadingContainer: {
     padding: 12,
     backgroundColor: '#000',
     borderRadius: 8,
     opacity: .8,
     justifyContent: 'center',
     alignItems: 'center'
   },

   loadingText: {
     fontWeight: 'bold',
     color: '#fff',
     textAlign: 'center',
     fontSize: Size(14),
   },

   spinnerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
      marginTop: 4,
   },
});
