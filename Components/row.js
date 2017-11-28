import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions
} from 'react-native';

import {
  MKCheckbox,
  MKButton,
  MKProgress,
} from 'react-native-material-kit';

import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

export default class Row extends Component {

  constructor(props){
    super(props);
    this.animatedValue = new Animated.Value(0);
    this.state = {
      timeRemain: moment.duration(
        moment().diff(moment(this.props.date, 'MM-DD-YYYY h:mm:ss a'))
      ),
      totalTime: moment.duration(
        moment(this.props.ddl, 'MM-DD-YYYY h:mm:ss a').diff(moment(this.props.date, 'MM-DD-YYYY h:mm:ss a'))
      ),
    };
    this.remainTimeTextGenerate = this.remainTimeTextGenerate.bind(this);
    this.remainTimeProgress = this.remainTimeProgress.bind(this);
  }

  todoTypeIconGenerate(){
    if(this.props.type === 'None')
      return (
        <Icon name="md-done-all" style={styles.iconStyle} size={14} color={this.props.theme.primaryColor} />
      );
    if(this.props.type === 'Work')
      return (
        <Icon name="ios-book" style={styles.iconStyle} size={14} color={this.props.theme.primaryColor} />
      );
    if(this.props.type === 'Life')
      return (
        <Icon name="md-basket" style={styles.iconStyle} size={14} color={this.props.theme.primaryColor} />
      );
  }

  componentDidMount() {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 250,
    }).start();

    if(this.props.ddl !== ""){
      setInterval( () => {
        if(this.props.timeUp || this.props.complete){
        } else {
          if(parseInt(this.state.timeRemain.asMilliseconds()) < 0){
            this.props.onTimeUp();
            return;
          }
          this.setState({
            timeRemain : moment.duration(
              moment(this.props.ddl, 'MM-DD-YYYY h:mm:ss a').diff(moment())
            )
          })
        }
      },1000)
    }
  }

  remainTimeTextGenerate(remainTime){
    if(this.props.timeUp) return "time up";
    if(this.props.complete) return "completed!";
    if(parseInt(remainTime.asDays()) > 0)
      return parseInt(remainTime.asDays()) + " days left";
    else if(parseInt(remainTime.asHours()) > 0)
      return parseInt(remainTime.asHours()) + " hours left";
    else if(parseInt(remainTime.asMinutes()) > 0)
      return parseInt(remainTime.asMinutes()) + " minutes left";
    else if(parseInt(remainTime.asSeconds()) > 0)
      return parseInt(remainTime.asSeconds()) + " seconds left";
    return "loading";
  }

  remainTimeProgress(remainTime){
    if(this.props.complete) return 0;
    if(this.props.timeUp) return 1.0;
    return Math.min(
      1.0,
      1.0 - parseInt(remainTime.asMilliseconds())/parseInt(this.state.totalTime.asMilliseconds())
    );
  }

  render() {
    const animatedRowStyle = [
      {opacity: this.animatedValue},
      {
        transform: [
          {scale: this.animatedValue},
          {rotate: this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['35deg', '0deg'],
            extrapolate: 'clamp',
          })}
        ]
      }
    ];
    const SaveButton = MKButton.coloredButton()
      .withText('SAVE')
      .withOnPress(() => {
        this.props.onToggleEdit(false);
      })
      .withStyle(styles.button)
      .build();

    const CancelButton = MKButton.coloredButton()
      .withText('CANCEL')
      .withOnPress(() => {
        this.props.onCancelEdit();
      })
      .withStyle(styles.button)
      .build();

    const DeleteButton = MKButton.coloredButton()
      .withText('DELETE')
      .withStyle(styles.button)
      .withOnPress(() => {
        // TODO: For now "remove item" makes the row below it stays in previous place for a while
        Animated.timing(this.animatedValue, {
          toValue: 0,
          duration: 250,
        }).start(() => {this.props.onRemove();})
      })
      .build();
    const {complete} = this.props;
    const textComponent = (
      <TouchableOpacity
        style={styles.textWrap}
        onLongPress={() => this.props.onToggleEdit(true)}
      >
        <Text style={[
          this.props.theme.cardContentStyle,
          {marginTop: -10, marginLeft: -10},
          complete && styles.complete
        ]}>
          {this.props.text}
        </Text>
        <View style={styles.metaView}>
          {this.todoTypeIconGenerate()}
          <Text style={styles.timeText}>
            {
              this.props.ddl === "" ?
                "No deadline" :
                "DDL: " + moment(
                  this.props.ddl, 'MM-DD-YYYY h:mm:ss a'
                ).calendar()
            }
          </Text>
        </View>
        {this.props.ddl === "" ? null :
          <View style={styles.progressWrap}>
            <MKProgress
              progress={this.remainTimeProgress(this.state.timeRemain)}
              style={styles.progressBar}
            />
            <Text
              style={[
                styles.progressText,
                {color: this.props.theme.primaryColor}
              ]}
            >
              {this.remainTimeTextGenerate(this.state.timeRemain)}
            </Text>
          </View>
        }
      </TouchableOpacity>
    );

    const editingComponent = (
      <View style={styles.textWrap}>
        <TextInput
          onChangeText={this.props.onUpdate}
          autoFocus
          value={this.props.text}
          style={
            [
              this.props.theme.cardContentStyle,
              {marginTop: -1, marginLeft: -10},
            ]
          }
          returnKeyType='done'
          multiline
        />
      </View>
    );

    const editingButtons = (
      <View style={styles.buttonWrap}>
        <SaveButton />
        <CancelButton />
      </View>
    );

    // TODO: the thumb animation in MKSwitch cannot perform state change properly
    return (
      <Animated.View style={[styles.container, animatedRowStyle]}>
        <MKCheckbox
          checked={complete}
          onCheckedChange={this.props.onComplete}
          borderOffColor={this.props.theme.primaryColor}
        />
        {this.props.editing ? editingComponent : textComponent}
        {this.props.editing ? editingButtons : <DeleteButton />}
      </Animated.View>
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
  progressWrap: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 3,
    alignItems: 'center'
  },
  progressText: {
    marginLeft: 0.01*width,
    fontSize: 0.03*width,
    fontWeight: 'bold',
    width: 0.2*width,
    textAlign: 'center'
  },
  progressBar: {
    width: 0.6*width,
  },
  input: {
    flex: 1,
    fontSize: 20,
    padding: 0,
    color: '#4d4d4d'
  },
  doneText: {
    color: '#4d4d4d',
    fontSize: 20
  },
  textWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  text: {
    fontSize: 20,
    color: '#4d4d4d'
  },
  complete: {
    textDecorationLine: "line-through",
    textDecorationColor: '#ff0000'
  },
  destroy: {
    fontSize: 20,
    color: "#CC9A9A"
  },
  metaView: {
    marginTop: 5,
    flexDirection: 'row',
  },
  iconStyle: {
    marginTop: -2,
  },
  timeText: {
    fontSize: 10,
    color: "#CC9A9A",
    marginLeft: 10,
  },
  buttonWrap: {
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  button: {
    marginVertical: 5,
    height: 0.05*height,
    width: 0.2*width,
  }
});