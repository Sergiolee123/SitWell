package com.fyp.sitwell.report;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.database.Cursor;
import android.os.Bundle;
import android.util.Log;

import com.fyp.sitwell.R;

import java.util.ArrayList;

public class ReportActivity extends AppCompatActivity {
    RecyclerView recyclerView;
    ArrayList<report_model> dataholder;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.report_fetchdata);

        recyclerView=(RecyclerView)findViewById(R.id.recview);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        Cursor cursor=new DBHandler(this).getAllSittingDataDESC();

        StringBuilder msg= new StringBuilder();
        String [] colNames = cursor.getColumnNames();
        for(int i = 0;i< colNames.length;i++){
            if(i==colNames.length-1)break;
            msg.append(colNames[i]).append(", ");
        }

        Log.d("CheckCol", msg.toString());

        dataholder=new ArrayList<>();

        while(cursor.moveToNext())
        {   report_model obj=new report_model(cursor.getString(0),cursor.getInt(2),cursor.getInt(3), cursor.getInt(4),cursor.getInt(5),cursor.getInt(6),
                cursor.getInt(7),cursor.getInt(8),cursor.getFloat(9),cursor.getString(10),cursor.getString(11),cursor.getFloat(12));
            dataholder.add(obj);
        }

        report_adapter adapter=new report_adapter(dataholder);
        recyclerView.setAdapter(adapter);
    }
}