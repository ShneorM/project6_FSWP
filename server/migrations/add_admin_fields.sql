-- ==========================================
-- הוספת עמודות ניהול לטבלת המשתמשים
-- ==========================================

-- הוספת שדה is_admin (ברירת מחדל: FALSE)
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- הוספת שדה is_blocked (ברירת מחדל: FALSE)
ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE;

-- ==========================================
-- הגדרת משתמש מנהל לצורכי בדיקה
-- ==========================================
UPDATE users SET is_admin = TRUE WHERE username = 'shlomo';
