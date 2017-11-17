import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Switch
} from 'react-native';

export default class Row extends Component {
  render() {
    const {complete} = this.props;
    return (
      <View style={styles.container}>
        <Switch
          value={complete}
          onValueChange={this.props.onComplete}
        />
        <View style={styles.textWrap}>
          <Text
            style={[styles.text, complete && styles.complete]}
          >
            {this.props.text}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  textWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  text: {
    fontSize: 24,
    color: '#4d4d4d'
  },
  complete: {
    textDecorationLine: "line-through"
  }
});