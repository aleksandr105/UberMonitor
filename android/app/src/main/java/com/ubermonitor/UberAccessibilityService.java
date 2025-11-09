
package com.ubermonitor;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.graphics.Rect;
import android.util.Log;

import java.util.HashSet;
import java.util.Set;

public class UberAccessibilityService extends AccessibilityService {
    private static final String TAG = "UberMonitorService";

    // Чтобы не дублировать логи подряд, можно держать set последних сообщений (простая дедупликация)
    private final Set<String> recentMessages = new HashSet<>();

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;

        CharSequence pkg = event.getPackageName();
        int eventType = event.getEventType();

        String eventTypeName = eventTypeToString(eventType);

        // Логируем тип события и пакет
        Log.d(TAG, "EVENT: " + eventTypeName + " PACKAGE: " + pkg);

        // Иногда event.getText() содержит полезные куски - логируем их тоже
        if (event.getText() != null && !event.getText().isEmpty()) {
            for (CharSequence t : event.getText()) {
                logOnce("EVENT_TEXT: " + t);
            }
        }

        // Попробуем получить корень активного окна и обойти дерево нод
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) {
            Log.d(TAG, "Root window is null (no window content available)");
            return;
        }

        // Рекурсивно обходим дерево и логируем полезные поля
        traverseNode(root, 0);

        // освобождаем (рекурсия не уничтожает ноды, но безопасно вызывать recycle)
        root.recycle();
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "AccessibilityService interrupted");
    }

    // Рекурсивный обход
    private void traverseNode(AccessibilityNodeInfo node, int depth) {
        if (node == null) return;

        // Собираем информацию о ноде
        CharSequence text = node.getText();
        CharSequence desc = node.getContentDescription();
        CharSequence viewId = null;
        try {
            viewId = node.getViewIdResourceName(); // может вернуть null
        } catch (Exception e) {
            // на некоторых API или нодах может бросать исключение — игнорируем
        }
        CharSequence className = node.getClassName();
        Rect bounds = new Rect();
        node.getBoundsInScreen(bounds);

        // Формируем строку вывода
        StringBuilder sb = new StringBuilder();
        sb.append(indent(depth));
        sb.append("NODE ");
        if (viewId != null) sb.append("[id=").append(viewId).append("] ");
        if (className != null) sb.append("[class=").append(className).append("] ");
        sb.append("[bounds=").append(bounds).append("] ");
        if (text != null && text.length() > 0) sb.append(" text:'").append(text).append("'");
        if (desc != null && desc.length() > 0) sb.append(" desc:'").append(desc).append("'");

        String out = sb.toString();
        logOnce(out);

        // Рекурсивно обойти детей
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                traverseNode(child, depth + 1);
                // важно recycle дочернюю ноду, если мы её получили
                child.recycle();
            }
        }
    }

    // Простейшая дедупликация логов: печатаем строку только если она новая
    private void logOnce(String s) {
        if (!recentMessages.contains(s)) {
            Log.d(TAG, s);
            // добавляем и держим набор небольшим — очищаем, если набралось много
            recentMessages.add(s);
            if (recentMessages.size() > 500) recentMessages.clear();
        }
    }

    // helper: перевод типа события в строку
    private String eventTypeToString(int type) {
        switch (type) {
            case AccessibilityEvent.TYPE_VIEW_CLICKED: return "TYPE_VIEW_CLICKED";
            case AccessibilityEvent.TYPE_VIEW_FOCUSED: return "TYPE_VIEW_FOCUSED";
            case AccessibilityEvent.TYPE_VIEW_LONG_CLICKED: return "TYPE_VIEW_LONG_CLICKED";
            case AccessibilityEvent.TYPE_VIEW_SELECTED: return "TYPE_VIEW_SELECTED";
            case AccessibilityEvent.TYPE_VIEW_TEXT_CHANGED: return "TYPE_VIEW_TEXT_CHANGED";
            case AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED: return "TYPE_WINDOW_STATE_CHANGED";
            case AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED: return "TYPE_WINDOW_CONTENT_CHANGED";
            case AccessibilityEvent.TYPE_NOTIFICATION_STATE_CHANGED: return "TYPE_NOTIFICATION_STATE_CHANGED";
            default: return "TYPE_OTHER(" + type + ")";
        }
    }

    private String indent(int depth) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < depth; i++) sb.append("  ");
        return sb.toString();
    }
}
