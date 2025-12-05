import 'package:flutter/material.dart';

class ColumnExample extends StatelessWidget {
  const ColumnExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,      
      color: const Color.fromARGB(255, 141, 183, 218),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.max,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text('Item 1'),
          Text('Item asdf  asdf asdf asdf asdf asdf asdf asdf sda 2'),
          Text('Item 3'),
          Text('Item 4'),
          Text('Item 5'),
        ],
      ),
    );
  }
}
