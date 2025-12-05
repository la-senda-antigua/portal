import 'package:flutter/material.dart';

class RowExample extends StatelessWidget {
  const RowExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 80),
      child: SizedBox(
        height: double.infinity,
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [            
            Text('Item 1'),            
            Expanded(
              child: Text('Item 2')
            ),
            Text('Item 3'),
            Text('Item 4'),            
          ],
        ),
      ),
    );
  }
}
