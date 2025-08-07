// SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    Toast.show({
      type: 'info',
      text1: 'Logging out...',
      text2: 'You will be redirected shortly.',
    });
    setTimeout(() => {
      router.replace('/');
    }, 1500);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all fields.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'New passwords do not match.',
      });
      return;
    }

    const currentPassword = await AsyncStorage.getItem('password') || 'mypassword';

    if (oldPassword !== currentPassword) {
      Toast.show({
        type: 'error',
        text1: 'Incorrect Password',
        text2: 'Old password is incorrect.',
      });
      return;
    }

    await AsyncStorage.setItem('password', newPassword);
    Toast.show({
      type: 'success',
      text1: 'Password Updated',
      text2: 'Your password was updated successfully.',
    });

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangePassword(false);
  };

  const handleHelpSupport = () => {
    Toast.show({
      type: 'info',
      text1: 'Help & Support',
      text2: '📧 help@yourapp.com | 📞 +91 98765 43210',
      visibilityTime: 4000,
    });
  };

  const handleAppInfo = () => {
    Toast.show({
      type: 'info',
      text1: 'App Info',
      text2: '📱 SchoolEase v1.0.0\n🧑‍💻 Zaltix Soft Solutions',
      visibilityTime: 4000,
    });
  };

  return (
    <LinearGradient colors={['#f0f4ff', '#e0f7fa']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Ionicons name="person-circle" size={64} color="#008080" />
          <Text style={styles.profileName}>Anjali</Text>
          <Text style={styles.profileSubtext}>Class: 10 - A | Roll No: 02</Text>
        </View>

        <View style={styles.settingGroup}>
          <SettingItem
            icon="key"
            text="Change Password"
            onPress={() => setShowChangePassword(!showChangePassword)}
          />
          {showChangePassword && (
            <View style={styles.passwordForm}>
              <PasswordInput
                placeholder="Old Password"
                value={oldPassword}
                onChange={setOldPassword}
                visible={showOld}
                toggle={() => setShowOld(!showOld)}
              />
              <PasswordInput
                placeholder="New Password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNew}
                toggle={() => setShowNew(!showNew)}
              />
              <PasswordInput
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showConfirm}
                toggle={() => setShowConfirm(!showConfirm)}
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                <Text style={styles.saveText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          )}

          <SettingItem icon="notifications" text="Notifications">
            <Switch
              value={notificationsEnabled}
              onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
          </SettingItem>

          <SettingItem icon="help-circle" text="Help & Support" onPress={handleHelpSupport} />
          <SettingItem icon="information-circle" text="App Info" onPress={handleAppInfo} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Toast container */}
      <Toast />
    </LinearGradient>
  );
}

const PasswordInput = ({ placeholder, value, onChange, visible, toggle }: any) => (
  <View style={styles.inputWrapper}>
    <TextInput
      placeholder={placeholder}
      style={styles.input}
      secureTextEntry={!visible}
      value={value}
      onChangeText={onChange}
    />
    <TouchableOpacity onPress={toggle} style={styles.eyeIcon}>
      <Ionicons name={visible ? 'eye-off' : 'eye'} size={22} color="#555" />
    </TouchableOpacity>
  </View>
);

const SettingItem = ({
  icon,
  text,
  children,
  onPress,
}: {
  icon: any;
  text: string;
  children?: React.ReactNode;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.settingLeft}>
      <Ionicons name={icon} size={24} color="#008080" />
      <Text style={styles.settingText}>{text}</Text>
    </View>
    {children ?? <Ionicons name="chevron-forward" size={20} color="#888" />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
    elevation: 4,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008080',
    marginTop: 10,
  },
  profileSubtext: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },
  settingGroup: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    elevation: 3,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#e53935',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
  },
  passwordForm: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    padding: 6,
  },
  saveButton: {
    backgroundColor: '#008080',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
