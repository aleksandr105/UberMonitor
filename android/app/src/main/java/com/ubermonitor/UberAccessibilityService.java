package com.ubermonitor;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

public class UberAccessibilityService extends AccessibilityService {

    private static final String TAG = "UberMonitorService";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Проверяем, что событие — изменение текста на экране
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
                || event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {

            // Получаем текст, который доступен через сервис
            if (event.getText() != null && !event.getText().isEmpty()) {
                for (CharSequence text : event.getText()) {
                    Log.d(TAG, "Текст с экрана: " + text);
                }
            }
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "AccessibilityService прерван");
    }
}
