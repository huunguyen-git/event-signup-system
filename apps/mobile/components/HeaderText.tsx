import {Text,StyleSheet} from 'react-native'


const HeaderText = () =>{
    return <>
        <Text style={styles.connect}> <Text style={styles.event}>EVENT </Text>CONNECT</Text>
    </>
}
const styles= StyleSheet.create({
    event:{
        fontWeight: 700,
        color:'#ffffff'
    },
    connect:{
        fontSize: 24,
        color: '#ffffff'
    }
})
export default HeaderText